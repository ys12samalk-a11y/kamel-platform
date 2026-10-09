import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب الإعدادات
export async function GET() {
  try {
    const { data, error } = await supabase.from("settings").select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // نحول المصفوفة لكائن { key: value }
    const settingsObj: Record<string, string> = {};
    (data || []).forEach((s) => {
      settingsObj[s.key] = s.value || "";
    });

    return NextResponse.json({
      success: true,
      settings: settingsObj,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// POST: حفظ/تحديث الإعدادات
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    // نحدّث كل مفتاح
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from("settings").upsert(
        {
          key,
          value: String(value),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}