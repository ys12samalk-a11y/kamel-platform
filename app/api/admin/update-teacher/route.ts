import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// PATCH: تحديث صلاحيات مدرس
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, grades, classes, subject, full_name, phone } = body;

    if (!code) {
      return NextResponse.json({ error: "الكود مطلوب" }, { status: 400 });
    }

    const updates: any = {};

    if (grades !== undefined) updates.grades = grades;
    if (classes !== undefined) updates.classes = classes;
    if (subject !== undefined) updates.subject = subject;
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "مفيش بيانات للتحديث" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("code", code)
      .select(
        "id, code, role, full_name, subject, phone, grades, classes, status"
      )
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    console.error("Catch error:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}