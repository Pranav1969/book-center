// // app/api/checkout/route.ts
// import Stripe from "stripe";
// import { NextResponse } from "next/server";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-06-20" as any,
// });

// export async function POST(req: Request) {
//   try {
//     const { items } = await req.json();

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"], // For India, 'card' is best. UPI requires specific setup.
//       line_items: items.map((item: any) => ({
//         price_data: {
//           currency: "inr", // ✅ Changed to INR for Indian accounts
//           product_data: {
//             name: item.title,
//             images: [item.image_url],
//             description: `Purchase from Karuna Book Center`,
//           },
//           unit_amount: Math.round(item.price * 100), 
//         },
//         quantity: 1,
//       })),
//       mode: "payment",
//       // Stripe India requires customer address collection for exports/international
//       billing_address_collection: "required", 
//       success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success`,
//       cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/`,
//     });

//     return NextResponse.json({ id: session.id });
//   } catch (err: any) {
//     console.error("Stripe Error:", err.message);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }