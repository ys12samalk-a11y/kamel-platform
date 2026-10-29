import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب السجل الشهري (بيانات محفوظة)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const classNum = searchParams.get("class");
    const month = searchParams.get("month");
    const subject = searchParams.get("subject");
    const teacherCode = searchParams.get("teacher");

    if (!grade || !classNum || !month || !subject || !teacherCode) {
      return NextResponse.json(
        { error: "كل البيانات مطلوبة" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("monthly_grades")
      .select("*")
      .eq("grade", grade)
      .eq("class", classNum)
      .eq("month", month)
      .eq("subject", subject)
      .eq("teacher_code", teacherCode);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      grades: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// POST: حفظ السجل الشهري
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      grade,
      class: className,
      month,
      subject,
      teacher_code,
      records,
    } = body;

    if (
      !grade ||
      !className ||
      !month ||
      !subject ||
      !teacher_code ||
      !records ||
      !Array.isArray(records) ||
      records.length === 0
    ) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    // نحضّر السجلات
    const rows = records.map((r: any) => ({
      student_code: r.student_code,
      student_name: r.student_name || null,
      grade,
      class: className,
      month,
      subject,
      teacher_code,
      week1_score: Number(r.week1_score) || 0,
      week2_score: Number(r.week2_score) || 0,
      week3_score: Number(r.week3_score) || 0,
      week4_score: Number(r.week4_score) || 0,
      average_score: Number(r.average_score) || 0,
      updated_at: new Date().toISOString(),
    }));

    // upsert
    const { data, error } = await supabase
      .from("monthly_grades")
      .upsert(rows, {
        onConflict: "student_code,month,subject,teacher_code",
      })
      .select();

    if (error) {
      console.error("Upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
    });
  } catch (error: any) {
    console.error("Catch error:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// DELETE: حذف سجل
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const { error } = await supabase
      .from("monthly_grades")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}