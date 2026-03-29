import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import axios from 'axios';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function normalizeId(id: string) {
  let cleaned = id.replace(/\D/g, ''); // Remove non-digits
  if (cleaned.length === 10) return `+91${cleaned}`; // Auto-add +91
  if (id.startsWith('+')) return id.replace(/\s/g, ''); // Already has +, just clean spaces
  return `+${cleaned}`; // Add + to whatever is left
}

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();
    const cleanId = normalizeId(identifier);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000).toISOString();

    // 1. Save to Supabase
    const { error: dbError } = await supabaseAdmin
      .from('otp_verifications')
      .upsert({ identifier: cleanId, otp_code: otp, expires_at: expiresAt });

    if (dbError) throw new Error("DB Error: " + dbError.message);

    // 2. Send via TextBee
    await axios.post(
      `https://api.textbee.dev/api/v1/gateway/devices/${process.env.TEXTBEE_DEVICE_ID}/send-sms`,
      { recipients: [cleanId], message: `Your Karuna Luxe code is: ${otp}` },
      { headers: { 'x-api-key': process.env.TEXTBEE_API_KEY } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}