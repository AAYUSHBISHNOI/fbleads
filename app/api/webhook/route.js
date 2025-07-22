import { NextResponse } from "next/server";
import sheetMap from "@/utils/sheetMap";
import { appendToGoogleSheet } from "@/lib/sheets";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = "anything_you_like"; // <-- Must match Facebook field exactly

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Verification failed", { status: 403 });
}

export async function POST(req) {
  const body = await req.json();

  if (body.object === "page") {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const lead = change.value;
        const formId = lead?.form_id;
        const sheetId = sheetMap[formId];

        if (!sheetId) {
          console.error("❌ Sheet ID not found for form_id:", formId);
          continue;
        }

        const fieldMap = {};
        lead.field_data?.forEach((field) => {
          const key = field.name.trim().toLowerCase();
          fieldMap[key] = field.values?.[0] || "";
        });

        const getValue = (...keys) => {
          for (const key of keys) {
            if (fieldMap[key]) return fieldMap[key];
          }
          return "";
        };

        try {
          await appendToGoogleSheet(sheetId, [
            new Date(lead.created_time).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            }),
            getValue("full name", "name"),
            getValue("phone number", "phone", "mobile"),
            getValue("city", "address", "location"),
            getValue("select a vehicle", "vehicle", "car"),
            "Facebook Ad",
          ]);
        } catch (err) {
          console.error("❌ Error appending to sheet:", err.message);
        }
      }
    }

    return NextResponse.json({ success: true });
  } else {
    return new NextResponse("Not a page event", { status: 400 });
  }
}
