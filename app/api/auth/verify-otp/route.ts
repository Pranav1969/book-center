import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Admin client for bypass operations (OTP check, profile creation, and logging)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Normalizes input to +91 format for database consistency
 */
function normalizeId(id: string) {
  let cleaned = id.replace(/\D/g, ''); // Remove non-digits
  if (cleaned.length === 10) return `+91${cleaned}`; // Auto-add +91
  if (id.startsWith('+')) return id.replace(/\s/g, ''); // Already has +, clean spaces
  return `+${cleaned}`; 
}

export async function POST(req: Request) {
  try {
    const { identifier, otp } = await req.json();
    const cleanId = normalizeId(identifier);
    const cookieStore = await cookies(); // Next.js 15 Async Cookies

    // 1. VERIFY OTP: Check against the custom otp_verifications table
    const { data: record, error: dbError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('identifier', cleanId)
      .eq('otp_code', otp.trim())
      .single();

    if (dbError || !record) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // 2. AUTH LINK: Generate a magic link for the phone-based email
    const userEmail = `${cleanId}@karunaluxe.com`;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
    });

    if (authError || !authData?.user || !authData?.properties) {
      console.error("Auth Link Error:", authError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }

    // 3. LOGGING: Record the login attempt
    await supabaseAdmin.from('login_logs').insert({
      user_id: authData.user.id,
      method: 'otp_sms',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    });

    // 4. SESSION: Initialize server client and set the session cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    );

    const actionLink = authData.properties.action_link;
    const token = new URL(actionLink).searchParams.get('token');

    if (!token) throw new Error("Could not extract session token");

    await supabase.auth.setSession({ 
      access_token: token, 
      refresh_token: '' 
    });

    // 5. PROFILE CHECK: Ensure user exists in the 'profiles' table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('id', authData.user.id)
      .maybeSingle();

    let isNewUser = false;

    if (!profile) {
      // Create initial profile if it doesn't exist
      await supabaseAdmin.from('profiles').insert({
        id: authData.user.id,
        phone_number: cleanId,
        email: userEmail,
        role: 'user',
        login_method: 'otp'
      });
      isNewUser = true;
    } else if (!profile.name) {
      // Profile exists but name is missing (incomplete setup)
      isNewUser = true;
    }

    // 6. CLEANUP: Delete the used OTP record
    await supabaseAdmin.from('otp_verifications').delete().eq('identifier', cleanId);

    // 7. RESPONSE: Redirect based on isNewUser
    return NextResponse.json({ 
      success: true, 
      isNewUser: isNewUser 
    });

  } catch (error: any) {
    console.error("VERIFY_OTP_CRASH:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}