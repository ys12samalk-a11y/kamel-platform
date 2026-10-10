import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب قائمة التقييمات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const subject = searchParams.get("subject");

    let query = supabase
      .from("assessments")
      .select("*")
      .order("created_at", { ascending: false });

    if (grade && grade !== "all") {
      query = query.eq("grade", grade);
    }

    if (subject && subject !== "all") {
      query = query.eq("subject", subject);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch assessments error:", error);
      return NextResponse.json(
        { error: "حدث خطأ أثناء جلب التقييمات" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      assessments: data || [],
    });
  } catch (error) {
    console.error("Get assessments error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في السيرفر" },
      { status: 500 }
    );
  }
}

// POST: زيادة عداد التحميلات
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "معرّف التقييم مطلوب" },
        { status: 400 }
      );
    }

    // نجيب العداد الحالي
    const { data: current } = await supabase
      .from("assessments")
      .select("download_count")
      .eq("id", id)
      .single();

    const newCount = (current?.download_count || 0) + 1;

    // نحدث
    await supabase
      .from("assessments")
      .update({ download_count: newCount })
      .eq("id", id);

    return NextResponse.json({ success: true, count: newCount });
  } catch (error) {
    console.error("Increment error:", error);
    return NextResponse.json(
      { error: "حدث خطأ" },
      { status: 500 }
    );
  }
}
// DELETE: حذف تقييم
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "المعرّف مطلوب" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("assessments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Catch error:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}