import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب قائمة المدرسين
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");

    let query = supabase
      .from("users")
      .select("id, code, full_name, subject, phone, whatsapp, facebook, email, bio, avatar_url")
      .eq("role", "teacher")
      .eq("status", "active")
      .order("full_name", { ascending: true });

    if (subject && subject !== "all") {
      query = query.eq("subject", subject);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      teachers: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// POST: إضافة مدرس جديد (للأدمن)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, full_name, subject, phone, whatsapp, facebook, email, bio, avatar_url } = body;

    if (!code || !full_name) {
      return NextResponse.json(
        { error: "الكود والاسم مطلوبين" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        code: code.trim().toUpperCase(),
        password: "123456", // كلمة سر افتراضية
        role: "teacher",
        full_name: full_name.trim(),
        subject: subject || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        facebook: facebook || null,
        email: email || null,
        bio: bio || null,
        avatar_url: avatar_url || null,
        status: "active",
        profile_completed: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "الكود ده مستخدم بالفعل" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, teacher: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}