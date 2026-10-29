import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب أبناء ولي الأمر
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentCode = searchParams.get("parent");

    if (!parentCode) {
      return NextResponse.json(
        { error: "كود ولي الأمر مطلوب" },
        { status: 400 }
      );
    }

    // 1. نجيب أكواد الأبناء من جدول parent_students
    const { data: links, error: linkError } = await supabase
      .from("parent_students")
      .select("student_code, relation")
      .eq("parent_code", parentCode);

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    if (!links || links.length === 0) {
      return NextResponse.json({
        success: true,
        students: [],
        message: "مفيش أبناء مربوطين بالحساب ده",
      });
    }

    // 2. نجيب بيانات كل ابن
    const studentCodes = links.map((l) => l.student_code);
    const { data: students, error: studentsError } = await supabase
      .from("users")
      .select("id, code, full_name, grade, class, phone, status, profile_completed")
      .in("code", studentCodes);

    if (studentsError) {
      return NextResponse.json(
        { error: studentsError.message },
        { status: 500 }
      );
    }

    // 3. نضيف صلة القرابة لكل ابن
    const studentsWithRelation = (students || []).map((s) => {
      const link = links.find((l) => l.student_code === s.code);
      return { ...s, relation: link?.relation || "parent" };
    });

    return NextResponse.json({
      success: true,
      students: studentsWithRelation,
      count: studentsWithRelation.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}