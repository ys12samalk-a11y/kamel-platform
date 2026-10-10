import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const classNum = searchParams.get("class");

    if (!grade || !classNum) {
      return NextResponse.json(
        { error: "الصف والفصل مطلوبين" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, code, full_name, grade, class, phone, profile_completed, status")
      .eq("role", "student")
      .eq("grade", grade)
      .eq("class", classNum)
      .eq("status", "active")
      .order("code", { ascending: true });

    if (error) {
      console.error("Fetch students error:", error);
      return NextResponse.json(
        { error: "حدث خطأ أثناء جلب الطلاب" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      students: data || [],
      count: data?.length || 0,
    });
  } catch (error: any) {
    console.error("Get students error:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ في السيرفر" },
      { status: 500 }
    );
  }
}