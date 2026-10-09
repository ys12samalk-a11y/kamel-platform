import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب الجدول
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
      .from("schedule")
      .select("*")
      .eq("grade", grade)
      .eq("class", classNum)
      .order("day")
      .order("period");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      schedule: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// POST: حفظ الجدول كامل
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grade, class: className, schedule } = body;

    if (!grade || !className || !schedule || !Array.isArray(schedule)) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    // نحذف الجدول القديم للفصل ده
    await supabase
      .from("schedule")
      .delete()
      .eq("grade", grade)
      .eq("class", className);

    // لو الجدول فاضي (مسح كامل)
    if (schedule.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // نضيف الجدول الجديد
    const rows = schedule.map((s: any) => ({
      grade,
      class: className,
      day: s.day,
      period: s.period,
      subject: s.subject,
      teacher_name: s.teacher_name || null,
    }));

    const { data, error } = await supabase
      .from("schedule")
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

// DELETE: حذف حصة معينة
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const classNum = searchParams.get("class");
    const day = searchParams.get("day");
    const period = searchParams.get("period");

    if (!grade || !classNum || !day || !period) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("schedule")
      .delete()
      .eq("grade", grade)
      .eq("class", classNum)
      .eq("day", day)
      .eq("period", Number(period));

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