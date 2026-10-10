import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";

// GET: جلب الدرجات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentCode = searchParams.get("student");
    const teacherCode = searchParams.get("teacher");
    const subject = searchParams.get("subject");

    let query = supabase
      .from("grades")
      .select("*")
      .order("created_at", { ascending: false });

    if (studentCode) query = query.eq("student_code", studentCode);
    if (teacherCode) query = query.eq("teacher_code", teacherCode);
    if (subject && subject !== "all") query = query.eq("subject", subject);

    const { data, error } = await query;

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

// POST: إضافة درجة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      student_code,
      student_name,
      subject,
      teacher_code,
      exam_type,
      exam_name,
      score,
      max_score,
      date,
      notes,
    } = body;

    if (
      !student_code ||
      !subject ||
      !teacher_code ||
      !exam_type ||
      !exam_name ||
      score === undefined
    ) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("grades")
      .insert({
        student_code,
        student_name: student_name || null,
        subject,
        teacher_code,
        exam_type,
        exam_name,
        score: Number(score),
        max_score: Number(max_score) || 100,
        date: date || new Date().toISOString().split("T")[0],
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ✅ بعت إشعار للطالب
    try {
      const percentage = Math.round(
        (Number(score) / (Number(max_score) || 100)) * 100
      );

      const emoji =
        percentage >= 85 ? "🌟" : percentage >= 60 ? "📊" : "📝";

      await createNotification(
        student_code,
        `${emoji} درجة جديدة في ${subject}`,
        `${exam_name}: ${score} / ${max_score} — نسبتك ${percentage}%`,
        "info",
        "/student"
      );
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    return NextResponse.json({ success: true, grade: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// DELETE: حذف درجة
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const { error } = await supabase.from("grades").delete().eq("id", id);

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