import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب درجات ابن معين
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentCode = searchParams.get("student");
    const parentCode = searchParams.get("parent");
    const type = searchParams.get("type") || "all"; // weekly | monthly | final | all

    if (!studentCode || !parentCode) {
      return NextResponse.json(
        { error: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    // نتأكد إن الطالب فعلاً ابن ولي الأمر ده
    const { data: link } = await supabase
      .from("parent_students")
      .select("id")
      .eq("parent_code", parentCode)
      .eq("student_code", studentCode)
      .single();

    if (!link) {
      return NextResponse.json(
        { error: "مش مسموحلك تشوف بيانات الطالب ده" },
        { status: 403 }
      );
    }

    const result: any = {
      weekly: [],
      monthly: [],
      final: [],
    };

    // 1. الدرجات الأسبوعية
    if (type === "all" || type === "weekly") {
      const { data: weekly } = await supabase
        .from("weekly_grades")
        .select("*")
        .eq("student_code", studentCode)
        .order("created_at", { ascending: false });
      result.weekly = weekly || [];
    }

    // 2. الدرجات الشهرية
    if (type === "all" || type === "monthly") {
      const { data: monthly } = await supabase
        .from("monthly_grades")
        .select("*")
        .eq("student_code", studentCode)
        .order("created_at", { ascending: false });
      result.monthly = monthly || [];
    }

    // 3. الدرجات النهائية
    if (type === "all" || type === "final") {
      const { data: final } = await supabase
        .from("final_grades")
        .select("*")
        .eq("student_code", studentCode)
        .order("created_at", { ascending: false });
      result.final = final || [];
    }

    return NextResponse.json({
      success: true,
      grades: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}