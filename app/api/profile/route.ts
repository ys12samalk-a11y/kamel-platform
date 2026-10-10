import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب بيانات المستخدم
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "الكود مطلوب" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .select(
        "id, code, role, full_name, grade, class, subject, phone, profile_completed, status, last_login, created_at"
      )
      .eq("code", code)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// PATCH: تحديث البيانات
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, updates } = body;

    if (!code || !updates) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("code", code)
      .select(
        "id, code, role, full_name, grade, class, subject, phone, profile_completed, status"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}