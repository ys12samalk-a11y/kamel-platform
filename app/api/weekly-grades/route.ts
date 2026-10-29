import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب الدرجات الأسبوعية
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const classNum = searchParams.get("class");
    const month = searchParams.get("month");
    const week = searchParams.get("week");
    const subject = searchParams.get("subject");
    const teacherCode = searchParams.get("teacher");

    if (!grade || !classNum || !month || !week || !subject || !teacherCode) {
      return NextResponse.json(
        { error: "كل البيانات مطلوبة" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("weekly_grades")
      .select("*")
      .eq("grade", grade)
      .eq("class", classNum)
      .eq("month", month)
      .eq("week", week)
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

// POST: حفظ الدرجات الأسبوعية
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      grade,
      class: className,
      month,
      week,
      subject,
      teacher_code,
      records,
    } = body;

    if (
      !grade ||
      !className ||
      !month ||
      !week ||
      !subject ||
      !teacher_code ||
      !records ||
      !Array.isArray(records) ||
      records.length === 0
    ) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    // نحضّر السجلات + نحسب المجموع تلقائي
    const rows = records.map((r: any) => {
      const assessment = Number(r.assessment_score) || 0;
      const behavior = Number(r.behavior_score) || 0;
      const notebook = Number(r.notebook_score) || 0;

      return {
        student_code: r.student_code,
        student_name: r.student_name || null,
        grade,
        class: className,
        month,
        week,
        subject,
        teacher_code,
        assessment_score: assessment,
        behavior_score: behavior,
        notebook_score: notebook,
        total_score: assessment + behavior + notebook,
        notes: r.notes || null,
        updated_at: new Date().toISOString(),
      };
    });

    // upsert
    const { data, error } = await supabase
      .from("weekly_grades")
      .upsert(rows, {
        onConflict: "student_code,month,week,subject,teacher_code",
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
      .from("weekly_grades")
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