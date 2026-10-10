import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET: جلب إحصائيات الفصول
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const classNum = searchParams.get("class");

    // لو محددين صف وفصل → نجيب طلاب الفصل
    if (grade && classNum) {
      const { data, error } = await supabase
        .from("users")
        .select("id, code, full_name, grade, class, phone, status, profile_completed")
        .eq("role", "student")
        .eq("grade", grade)
        .eq("class", classNum)
        .order("code", { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        students: data || [],
        count: data?.length || 0,
      });
    }

    // لو مش محددين → نجيب إحصائيات كل فصل
    const { data, error } = await supabase
      .from("users")
      .select("grade, class")
      .eq("role", "student");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // نجمع العدد لكل فصل
    const stats: Record<string, Record<string, number>> = {
      "1": {},
      "2": {},
      "3": {},
    };

    (data || []).forEach((u) => {
      const g = u.grade || "unassigned";
      const c = u.class || "unassigned";
      if (!stats[g]) stats[g] = {};
      if (!stats[g][c]) stats[g][c] = 0;
      stats[g][c]++;
    });

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// POST: إضافة طالب لفصل
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, grade, class: className } = body;

    if (!studentId || !grade || !className) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .update({ grade, class: className })
      .eq("id", studentId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// DELETE: إزالة طالب من فصل
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("id");

    if (!studentId) {
      return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const { error } = await supabase
      .from("users")
      .update({ grade: null, class: null })
      .eq("id", studentId);

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
