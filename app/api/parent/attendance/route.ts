import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentCode = searchParams.get("student");
    const parentCode = searchParams.get("parent");

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

    // نجيب سجل الحضور
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_code", studentCode)
      .order("date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // نحسب الإحصائيات
    const records = data || [];
    const stats = {
      total: records.length,
      present: records.filter((r) => r.status === "present").length,
      absent: records.filter((r) => r.status === "absent").length,
      late: records.filter((r) => r.status === "late").length,
    };

    return NextResponse.json({
      success: true,
      attendance: records,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}