import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// PATCH: تحديث بيانات مدرس
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { full_name, subject, phone, whatsapp, facebook, email, bio, avatar_url } = body;

    if (!id) {
      return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const updates: any = {};
    if (full_name !== undefined) updates.full_name = full_name.trim();
    if (subject !== undefined) updates.subject = subject || null;
    if (phone !== undefined) updates.phone = phone || null;
    if (whatsapp !== undefined) updates.whatsapp = whatsapp || null;
    if (facebook !== undefined) updates.facebook = facebook || null;
    if (email !== undefined) updates.email = email || null;
    if (bio !== undefined) updates.bio = bio || null;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "مفيش بيانات للتحديث" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .eq("role", "teacher")
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, teacher: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// DELETE: حذف مدرس
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .eq("role", "teacher");

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