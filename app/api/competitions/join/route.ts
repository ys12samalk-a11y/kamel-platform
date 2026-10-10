import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST: اشتراك في مسابقة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      competition_id,
      student_code,
      student_name,
      grade,
      class: className,
      submission_text,
      submission_url,
    } = body;

    if (!competition_id || !student_code) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    // نتأكد إنه مش مشترك قبل كده
    const { data: existing } = await supabase
      .from("competition_entries")
      .select("id")
      .eq("competition_id", competition_id)
      .eq("student_code", student_code)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "إنت مشترك في المسابقة دي بالفعل" },
        { status: 400 }
      );
    }

    // نتأكد إن المسابقة مفتوحة
    const { data: comp } = await supabase
      .from("competitions")
      .select("status, deadline")
      .eq("id", competition_id)
      .single();

    if (!comp) {
      return NextResponse.json({ error: "المسابقة غير موجودة" }, { status: 404 });
    }

    if (comp.status !== "open") {
      return NextResponse.json(
        { error: "المسابقة مغلقة" },
        { status: 400 }
      );
    }

    // نضيف الاشتراك
    const { data, error } = await supabase
      .from("competition_entries")
      .insert({
        competition_id,
        student_code,
        student_name: student_name || null,
        grade: grade || null,
        class: className || null,
        submission_text: submission_text?.trim() || null,
        submission_url: submission_url?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// DELETE: إلغاء الاشتراك
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get("competition");
    const studentCode = searchParams.get("student");

    if (!competitionId || !studentCode) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const { error } = await supabase
      .from("competition_entries")
      .delete()
      .eq("competition_id", competitionId)
      .eq("student_code", studentCode);

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

// PATCH: إعلان فائز
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { entry_id, is_winner } = body;

    if (!entry_id) {
      return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("competition_entries")
      .update({ is_winner })
      .eq("id", entry_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}
