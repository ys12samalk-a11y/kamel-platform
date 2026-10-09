import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, full_name, grade, class: className, phone, newPassword } = body;

    // التحقق من البيانات
    if (!code || !full_name || !newPassword) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "كلمة السر لازم تكون 6 حروف على الأقل" },
        { status: 400 }
      );
    }

    // تحديث البيانات في Supabase
    const { data, error } = await supabase
      .from("users")
      .update({
        full_name: full_name.trim(),
        grade: grade || null,
        class: className || null,
        phone: phone?.trim() || null,
        password: newPassword.trim(),
        profile_completed: true,
      })
      .eq("code", code.trim().toUpperCase())
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { error: "حدث خطأ أثناء حفظ البيانات" },
        { status: 500 }
      );
    }

    // إرجاع البيانات بدون كلمة السر
    const { password: _, ...userData } = data;

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في السيرفر" },
      { status: 500 }
    );
  }
}