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

        // Normalize and collect field data
        const fieldMap = {};
        lead.field_data?.forEach((field) => {
          const key = field.name.trim().toLowerCase();
          fieldMap[key] = field.values?.[0] || "";
        });

        // Flexible matching
        const getValue = (...keys) => {
          for (const key of keys) {
            if (fieldMap[key]) return fieldMap[key];
          }
          return "";
        };

        try {
          await appendToGoogleSheet(sheetId, [
            // S.no = auto-increment in the sheet
            new Date(lead.created_time).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            }), // Date
            getValue("full name", "name"), // Name
            getValue("phone number", "phone", "mobile"), // Contact Number
            getValue("city", "address", "location"), // City
            getValue("select a vehicle", "vehicle", "car"), // Product
            "Facebook Ad", // Source (hardcoded)
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
