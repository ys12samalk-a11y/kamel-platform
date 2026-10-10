import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherCode = searchParams.get("teacher");
    const grade = searchParams.get("grade");
    const classNum = searchParams.get("class");

    let query = supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (teacherCode) query = query.eq("teacher_code", teacherCode);
    if (grade) query = query.eq("grade", grade);
    if (classNum) query = query.eq("class", classNum);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      announcements: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      body: announcementBody,
      teacher_code,
      teacher_name,
      grade,
      class: className,
      priority,
    } = body;

    if (!title || !announcementBody || !teacher_code) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert({
        title: title.trim(),
        body: announcementBody.trim(),
        teacher_code,
        teacher_name: teacher_name || null,
        grade: grade || null,
        class: className || null,
        target: "class",
        priority: priority || "normal",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, announcement: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const { error } = await supabase
      .from("announcements")
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
