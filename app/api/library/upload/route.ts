import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// تحويل العربي لإنجليزي في المسار
const subjectToEnglish: Record<string, string> = {
  "عربي": "arabic",
  "إنجليزي": "english",
  "رياضيات": "math",
  "علوم": "science",
  "دراسات": "social",
  "دين": "religion",
  "حاسب آلي": "computer",
  "أحياء": "biology",
  "فيزياء": "physics",
  "كيمياء": "chemistry",
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const subject = formData.get("subject") as string;
    const grade = formData.get("grade") as string;
    const uploaded_by = formData.get("uploaded_by") as string;

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
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
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

    // استبدال العربي في المسار
    const subjectEn = subjectToEnglish[subject] || "other";
    const filePath = `grade-${grade}/${subjectEn}/${fileName}`;

    // رفع الملف
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("library")
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

    // الرابط العام
    const { data: urlData } = supabase.storage
      .from("library")
      .getPublicUrl(filePath);

    // حفظ في الجدول
    const { data, error: dbError } = await supabase
      .from("library_files")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        subject: subject.trim(),
        grade: grade.trim(),
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: uploaded_by || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      await supabase.storage.from("library").remove([filePath]);
      return NextResponse.json(
        { error: `خطأ الحفظ: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      file: data,
    });
  } catch (error: any) {
    console.error("Catch error:", error);
    return NextResponse.json(
      { error: `خطأ: ${error?.message || "غير معروف"}` },
      { status: 500 }
    );
  }
}