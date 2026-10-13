import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";

// POST: المدرس يبعت إشعار لولي أمر
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      student_code,
      teacher_code,
      teacher_name,
      subject,
      message,
      type,
    } = body;

    if (!student_code || !message || !teacher_code) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    // نجيب كل أولياء أمور الطالب
    const { data: links } = await supabase
      .from("parent_students")
      .select("parent_code")
      .eq("student_code", student_code);

    if (!links || links.length === 0) {
      return NextResponse.json(
        { error: "الطالب ده مش مربوط بأي ولي أمر" },
        { status: 404 }
      );
    }

    // نجيب اسم الطالب
    const { data: student } = await supabase
      .from("users")
      .select("full_name, code")
      .eq("code", student_code)
      .single();

    const studentName = student?.full_name || student_code;
    const teacherLabel = teacher_name ? `أ. ${teacher_name}` : "المدرس";

    // نبعت إشعار لكل ولي أمر
    const notifTitle = `📩 رسالة من ${teacherLabel}${
      subject ? ` — ${subject}` : ""
    }`;
    const notifMessage = `بخصوص ${studentName}: ${message
      .trim()
      .substring(0, 150)}`;

    let sentCount = 0;
    const parentCodes: string[] = [];

    for (const link of links) {
      try {
        await createNotification(
          link.parent_code,
          notifTitle,
          notifMessage,
          type || "info",
          "/parent"
        );
        parentCodes.push(link.parent_code);
        sentCount++;
      } catch (notifErr) {
        console.error("Notification error:", notifErr);
      }
    }

    // ✅ نحفظ في السجل
    await supabase.from("parent_notifications_log").insert({
      teacher_code,
      teacher_name: teacher_name || null,
      student_code,
      student_name: studentName,
      parent_codes: parentCodes,
      subject: subject?.trim() || null,
      message: message.trim(),
      type: type || "info",
      sent_count: sentCount,
    });

    return NextResponse.json({
      success: true,
      sent: sentCount,
      message: `تم إرسال الإشعار لـ ${sentCount} ولي أمر`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// GET: جلب سجل الإشعارات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherCode = searchParams.get("teacher");
    const limit = searchParams.get("limit") || "50";

    if (!teacherCode) {
      return NextResponse.json(
        { error: "كود المدرس مطلوب" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("parent_notifications_log")
      .select("*")
      .eq("teacher_code", teacherCode)
      .order("created_at", { ascending: false })
      .limit(Number(limit));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      logs: data || [],
      count: data?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}