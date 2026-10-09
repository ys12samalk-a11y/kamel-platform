import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST: لايك على موهبة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { talent_id, student_code } = body;

    if (!talent_id || !student_code) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    // نشوف لو عمل لايك قبل كده
    const { data: existing } = await supabase
      .from("talent_likes")
      .select("id")
      .eq("talent_id", talent_id)
      .eq("student_code", student_code)
      .single();

    if (existing) {
      // لو موجود، نشيله (Unlike)
      await supabase.from("talent_likes").delete().eq("id", existing.id);

      // نقلل العداد
      const { data: current } = await supabase
        .from("talents")
        .select("likes_count")
        .eq("id", talent_id)
        .single();

      const newCount = Math.max((current?.likes_count || 1) - 1, 0);

      await supabase
        .from("talents")
        .update({ likes_count: newCount })
        .eq("id", talent_id);

      return NextResponse.json({
        success: true,
        liked: false,
        likes_count: newCount,
      });
    } else {
      // لو مش موجود، نضيفه (Like)
      await supabase.from("talent_likes").insert({
        talent_id,
        student_code,
      });

      // نزود العداد
      const { data: current } = await supabase
        .from("talents")
        .select("likes_count")
        .eq("id", talent_id)
        .single();

      const newCount = (current?.likes_count || 0) + 1;

      await supabase
        .from("talents")
        .update({ likes_count: newCount })
        .eq("id", talent_id);

      return NextResponse.json({
        success: true,
        liked: true,
        likes_count: newCount,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// GET: نشوف لو الطالب عمل لايك
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const talentId = searchParams.get("talent");
    const studentCode = searchParams.get("student");

    if (!talentId || !studentCode) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    const { data } = await supabase
      .from("talent_likes")
      .select("id")
      .eq("talent_id", talentId)
      .eq("student_code", studentCode)
      .single();

    return NextResponse.json({
      success: true,
      liked: !!data,
    });
  } catch (error: any) {
    return NextResponse.json({ success: true, liked: false });
  }
}