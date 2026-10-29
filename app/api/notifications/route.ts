import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب إشعارات المستخدم
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userCode = searchParams.get("user");

    if (!userCode) {
      return NextResponse.json({ error: "الكود مطلوب" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_code", userCode)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const unreadCount = (data || []).filter((n) => !n.is_read).length;

    return NextResponse.json({
      success: true,
      notifications: data || [],
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// POST: إنشاء إشعار جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_code, title, message, type, link } = body;

    if (!user_code || !title || !message) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_code,
        title: title.trim(),
        message: message.trim(),
        type: type || "info",
        link: link || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// PATCH: تعليم الإشعارات كمقروءة
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_code, notification_id, mark_all } = body;

    if (!user_code) {
      return NextResponse.json({ error: "الكود مطلوب" }, { status: 400 });
    }

    // تعليم إشعار واحد
    if (notification_id) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification_id)
        .eq("user_code", user_code);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // تعليم كل الإشعارات
    if (mark_all) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_code", user_code)
        .eq("is_read", false);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// DELETE: حذف إشعار
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const { error } = await supabase
      .from("notifications")
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