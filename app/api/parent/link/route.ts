import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب كل أولياء الأمور (للإدارة)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const parentCode = searchParams.get("parent");

    // لو فيه parent → نجيب أبناء ولي الأمر ده
    if (parentCode) {
      const { data: links } = await supabase
        .from("parent_students")
        .select("student_code, relation, created_at")
        .eq("parent_code", parentCode);

      if (!links || links.length === 0) {
        return NextResponse.json({ success: true, students: [] });
      }

      const studentCodes = links.map((l) => l.student_code);
      const { data: students } = await supabase
        .from("users")
        .select("id, code, full_name, grade, class")
        .in("code", studentCodes);

      return NextResponse.json({
        success: true,
        students: students || [],
      });
    }

    // لو مفيش parent → نجيب كل أولياء الأمور
    let query = supabase
      .from("users")
      .select("id, code, full_name, phone, status, created_at")
      .eq("role", "parent")
      .order("code", { ascending: true });

    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`code.ilike.%${s}%,full_name.ilike.%${s}%`);
    }

    const { data, error } = await query.limit(2000);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // نجيب عدد الأبناء لكل ولي أمر
    const parentsWithCount = await Promise.all(
      (data || []).map(async (p) => {
        const { count } = await supabase
          .from("parent_students")
          .select("*", { count: "exact", head: true })
          .eq("parent_code", p.code);
        return { ...p, children_count: count || 0 };
      })
    );

    return NextResponse.json({
      success: true,
      parents: parentsWithCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// POST: ربط طالب بولي أمر
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parent_code, student_code, relation } = body;

    if (!parent_code || !student_code) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    // نتأكد إن الطالب موجود
    const { data: student } = await supabase
      .from("users")
      .select("code, role")
      .eq("code", student_code)
      .eq("role", "student")
      .single();

    if (!student) {
      return NextResponse.json(
        { error: "الطالب غير موجود" },
        { status: 404 }
      );
    }

    // نضيف الربط
    const { data, error } = await supabase
      .from("parent_students")
      .insert({
        parent_code,
        student_code,
        relation: relation || "parent",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "الطالب مربوط بالفعل بولي الأمر ده" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, link: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// DELETE: فك ربط طالب من ولي أمر
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentCode = searchParams.get("parent");
    const studentCode = searchParams.get("student");

    if (!parentCode || !studentCode) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const { error } = await supabase
      .from("parent_students")
      .delete()
      .eq("parent_code", parentCode)
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