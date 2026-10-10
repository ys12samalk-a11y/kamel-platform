import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET: جلب المواهب
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentCode = searchParams.get("student");
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");

    let query = supabase
      .from("talents")
      .select("*")
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false });

    if (studentCode) query = query.eq("student_code", studentCode);
    if (category && category !== "all") query = query.eq("category", category);
    if (limit) query = query.limit(Number(limit));

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      talents: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// POST: إضافة موهبة جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      student_code,
      student_name,
      grade,
      class: className,
      title,
      description,
      category,
      media_url,
      media_type,
    } = body;

    if (!student_code || !title || !category) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("talents")
      .insert({
        student_code,
        student_name: student_name || null,
        grade: grade || null,
        class: className || null,
        title: title.trim(),
        description: description?.trim() || null,
        category,
        media_url: media_url || null,
        media_type: media_type || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, talent: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// DELETE: حذف موهبة
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const { error } = await supabase.from("talents").delete().eq("id", id);

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
