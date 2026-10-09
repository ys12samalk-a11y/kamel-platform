import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب الشكاوى
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentCode = searchParams.get("student");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    let query = supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (studentCode) query = query.eq("student_code", studentCode);
    if (type && type !== "all") query = query.eq("type", type);
    if (status && status !== "all") query = query.eq("status", status);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      complaints: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// POST: إضافة شكوى/اقتراح
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      body: complaintBody,
      student_code,
      student_name,
      grade,
      class: className,
      is_anonymous,
    } = body;

    if (!type || !title || !complaintBody) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("complaints")
      .insert({
        type,
        title: title.trim(),
        body: complaintBody.trim(),
        student_code: is_anonymous ? null : student_code,
        student_name: is_anonymous ? null : student_name,
        grade: is_anonymous ? null : grade,
        class: is_anonymous ? null : className,
        is_anonymous: is_anonymous || false,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, complaint: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// PATCH: تحديث الحالة (للأدمن)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, admin_response } = body;

    if (!id) {
      return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (admin_response !== undefined) {
      updates.admin_response = admin_response;
      updates.responded_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("complaints")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, complaint: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// DELETE: حذف شكوى
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const { error } = await supabase.from("complaints").delete().eq("id", id);

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