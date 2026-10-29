import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// تحويل العربي لإنجليزي
const subjectToEnglish: Record<string, string> = {
  "عربي": "arabic",
  "إنجليزي": "english",
  "رياضيات": "math",
  "علوم": "science",
  "دراسات": "social",
  "دين": "religion",
  "حاسب آلي": "computer",
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const subject = formData.get("subject") as string;
    const grade = formData.get("grade") as string;
    const week = formData.get("week") as string;
    const description = formData.get("description") as string;

    // التحقق
    if (!file || !title || !subject || !grade) {
      return NextResponse.json(
        { error: "البيانات ناقصة" },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `نوع الملف غير مدعوم (${file.type})` },
        { status: 400 }
      );
    }

    // التحقق من الحجم (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "حجم الملف كبير (الحد الأقصى 50MB)" },
        { status: 400 }
      );
    }

    // اسم فريد للملف
    const fileExt = file.name.split(".").pop() || "pdf";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    // ⚠️ استبدال العربي بإنجليزي في المسار
    const subjectEn = subjectToEnglish[subject] || "other";
    const filePath = `grade-${grade}/${subjectEn}/${fileName}`;

    // رفع الملف على Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("assessments")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("=== UPLOAD ERROR ===");
      console.error("Message:", uploadError.message);
      return NextResponse.json(
        { error: `خطأ الرفع: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // الرابط العام
    const { data: urlData } = supabase.storage
      .from("assessments")
      .getPublicUrl(filePath);

    // حفظ في الجدول
    const { data, error: dbError } = await supabase
      .from("assessments")
      .insert({
        title: title.trim(),
        subject: subject.trim(),
        grade: grade.trim(),
        week: week?.trim() || null,
        description: description?.trim() || null,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      console.error("=== DB ERROR ===");
      console.error("Message:", dbError.message);
      await supabase.storage.from("assessments").remove([filePath]);
      return NextResponse.json(
        { error: `خطأ الحفظ: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment: data,
    });
  } catch (error: any) {
    console.error("=== CATCH ERROR ===");
    console.error("Message:", error?.message);
    return NextResponse.json(
      { error: `خطأ: ${error?.message || "غير معروف"}` },
      { status: 500 }
    );
  }
}