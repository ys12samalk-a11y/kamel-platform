import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET: جلب قائمة المستخدمين
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const grade = searchParams.get("grade");
    const search = searchParams.get("search");

    let query = supabase
      .from("users")
      .select("id, code, role, full_name, grade, class, phone, profile_completed, status, last_login, created_at")
      .order("code", { ascending: true });

    if (role && role !== "all") {
      query = query.eq("role", role);
    }

    if (grade && grade !== "all") {
      query = query.eq("grade", grade);
    }

    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`code.ilike.%${s}%,full_name.ilike.%${s}%`);
    }

    const { data, error } = await query.limit(2000);

    if (error) {
      console.error("Fetch users error:", error);
      return NextResponse.json(
        { error: "حدث خطأ أثناء جلب المستخدمين" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: data || [],
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ في السيرفر" },
      { status: 500 }
    );
  }
}

// PATCH: تحديث مستخدم (تفعيل/إيقاف)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const { password: _, ...userData } = data;

    return NextResponse.json({ success: true, user: userData });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// DELETE: حذف مستخدم
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "معرّف المستخدم مطلوب" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
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
