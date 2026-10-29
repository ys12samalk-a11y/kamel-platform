import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب السجل النهائي
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const classNum = searchParams.get("class");
    const subject = searchParams.get("subject");
    const teacherCode = searchParams.get("teacher");

    if (!grade || !classNum || !subject || !teacherCode) {
      return NextResponse.json(
        { error: "كل البيانات مطلوبة" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("final_grades")
      .select("*")
      .eq("grade", grade)
      .eq("class", classNum)
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

// POST: حفظ السجل النهائي
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      grade,
      class: className,
      subject,
      teacher_code,
      records,
    } = body;

    if (
      !grade ||
      !className ||
      !subject ||
      !teacher_code ||
      !records ||
      !Array.isArray(records) ||
      records.length === 0
    ) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    // نحضّر السجلات
    const rows = records.map((r: any) => {
      const m1 = Number(r.month1_score) || 0;
      const m2 = Number(r.month2_score) || 0;
      const m3 = Number(r.month3_score) || 0;
      const e1 = Number(r.month1_exam) || 0;
      const e2 = Number(r.month2_exam) || 0;

      // متوسط الشهور = (شهر1 + شهر2 + شهر3) ÷ 3 = من 40
      const avgMonths = Math.round(((m1 + m2 + m3) / 3) * 100) / 100;

      // المجموع النهائي = متوسط الشهور + اختبار1 + اختبار2 = من 70
      const finalScore = Math.round((avgMonths + e1 + e2) * 100) / 100;

      return {
        student_code: r.student_code,
        student_name: r.student_name || null,
        grade,
        class: className,
        subject,
        teacher_code,
        month1_score: m1,
        month2_score: m2,
        month3_score: m3,
        month1_exam: e1,
        month2_exam: e2,
        average_months: avgMonths,
        final_score: finalScore,
        updated_at: new Date().toISOString(),
      };
    });

    // upsert
    const { data, error } = await supabase
      .from("final_grades")
      .upsert(rows, {
        onConflict: "student_code,subject,teacher_code",
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
      .from("final_grades")
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