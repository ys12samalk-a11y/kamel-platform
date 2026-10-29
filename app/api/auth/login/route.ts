import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, password } = body;

    if (!code || !password) {
      return NextResponse.json(
        { error: "الرجاء إدخال الكود وكلمة السر" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "الكود غير موجود" },
        { status: 401 }
      );
    }

    if (data.password !== password.trim()) {
      return NextResponse.json(
        { error: "كلمة السر غلط" },
        { status: 401 }
      );
    }

    if (data.status === "suspended") {
      return NextResponse.json(
        { error: "الحساب موقوف، تواصل مع الإدارة" },
        { status: 403 }
      );
    }

    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", data.id);

    const { password: _, ...userData } = data;

    return NextResponse.json({
      success: true,
      user: userData,
      needsProfile: !data.profile_completed,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في السيرفر" },
      { status: 500 }
    );
  }
}