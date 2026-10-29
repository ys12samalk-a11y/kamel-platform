import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "مفيش ملف مرفوع" }, { status: 400 });
    }

    // التحقق من نوع الملف
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "نوع الصورة غير مدعوم (فقط JPG, PNG, WEBP)" },
        { status: 400 }
      );
    }

    // التحقق من الحجم (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "حجم الصورة كبير (الحد الأقصى 5MB)" },
        { status: 400 }
      );
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // رفع على Supabase Storage في bucket اسمه teachers
    const { error: uploadError } = await supabase.storage
      .from("teachers")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: `خطأ الرفع: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // جلب الرابط العام
    const { data: urlData } = supabase.storage
      .from("teachers")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
    });
  } catch (error: any) {
    console.error("Catch error:", error);
    return NextResponse.json(
      { error: `خطأ: ${error?.message || "غير معروف"}` },
      { status: 500 }
    );
  }
}