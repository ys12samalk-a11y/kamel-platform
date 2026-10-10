import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET: جلب سجل الغياب
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentCode = searchParams.get("student");
    const date = searchParams.get("date");
    const classNum = searchParams.get("class");
    const grade = searchParams.get("grade");

    let query = supabase
      .from("attendance")
      .select("*")
      .order("date", { ascending: false });

    if (studentCode) query = query.eq("student_code", studentCode);
    if (date) query = query.eq("date", date);
    if (classNum) query = query.eq("class", classNum);
    if (grade) query = query.eq("grade", grade);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, attendance: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// POST: تسجيل حضور مجموعة طلاب
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { records, date, grade, class: className, teacher_code } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    // تجهيز السجلات
    const rows = records.map((r: any) => ({
      student_code: r.student_code,
      student_name: r.student_name || null,
      grade: grade || null,
      class: className || null,
      date: date || new Date().toISOString().split("T")[0],
      status: r.status, // present / absent / late
      teacher_code: teacher_code || null,
      notes: r.notes || null,
    }));

    // نحذف السجلات القديمة لنفس اليوم والفصل (لو موجودة)
    if (date && className) {
      await supabase
        .from("attendance")
        .delete()
        .eq("date", date)
        .eq("class", className)
        .eq("grade", grade);
    }

    const { data, error } = await supabase
      .from("attendance")
      .insert(rows)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}
