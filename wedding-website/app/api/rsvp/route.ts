import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.email || !body.attending) {
      return NextResponse.json({ ok: false, message: "Required fields are missing." }, { status: 400 });
    }

    // Honeypot check
    if (body.honeypot) {
      return NextResponse.json({ ok: false, message: "Invalid submission." }, { status: 400 });
    }

    // Prepare payload
    const payload = {
      secret: process.env.GOOGLE_RSVP_WEBHOOK_SECRET,
      payload: {
        name: body.name,
        email: body.email,
        attending: body.attending,
        guestCount: body.guestCount || "",
        guestNames: body.guestNames || "",
        dietaryRestrictions: body.dietaryRestrictions || "",
        events: {
          welcomeEvent: body.welcomeEvent || "",
          sundayBrunch: body.sundayBrunch || "",
        },
        optionalStockholmEvents: body.optionalStockholmEvents || "",
        message: body.message || "",
      },
    };

    // Send to Google Apps Script
    const webhookUrl = process.env.GOOGLE_RSVP_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ ok: false, message: "Server configuration error." }, { status: 500 });
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("Webhook response status:", response.status);
    console.log("Webhook response text:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse webhook response as JSON:", parseError);
      return NextResponse.json({ ok: false, message: "Invalid response from server." }, { status: 500 });
    }

    if (response.ok && result.ok) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ ok: false, message: "Submission failed." }, { status: 500 });
    }
  } catch (error) {
    console.error("RSVP API error:", error);
    return NextResponse.json({ ok: false, message: "Internal server error." }, { status: 500 });
  }
}