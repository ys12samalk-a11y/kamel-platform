import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userRole, userCode } = body;

    if (!message) {
      return NextResponse.json(
        { error: "الرسالة مطلوبة" },
        { status: 400 }
      );
    }

    // نجمع السياق
    const context: any = { role: userRole };

    if (userRole === "student" && userCode) {
      const { data: studentData } = await supabase
        .from("users")
        .select("full_name, grade, class")
        .eq("code", userCode)
        .single();

      if (studentData) context.student = studentData;

      if (studentData?.grade && studentData?.class) {
        const { data: announcements } = await supabase
          .from("announcements")
          .select("title, body, teacher_name")
          .eq("grade", studentData.grade)
          .eq("class", studentData.class)
          .order("created_at", { ascending: false })
          .limit(5);

        context.announcements = announcements || [];

        const { data: schedule } = await supabase
          .from("schedule")
          .select("day, period, subject, teacher_name")
          .eq("grade", studentData.grade)
          .eq("class", studentData.class)
          .order("day")
          .order("period");

        context.schedule = schedule || [];
      }
    }

    const systemPrompt = `أنت مساعد ذكي في "منصة الحويج" — منصة مدرسة الشهيد محمد كامل الحويج.
تجاوب بالعربي المصري البسيط. كن ودود ومختصر.

📚 معلومات المنصة:
- المنصة فيها 8 خدمات رئيسية:
  1. التقييمات — لتحميل تقييمات الوزارة الأسبوعية
  2. الإعلانات — إعلانات المدرسين لكل فصل
  3. المكتبة — ملفات ومذكرات للتحميل
  4. المسابقات — شارك واكسب جوائز
  5. المواهب — اعرض موهبتك لزمايلك
  6. جدول الحصص — جدولك الأسبوعي
  7. الشكاوى والاقتراحات — كلم الإدارة بحرية
  8. المساعد الذكي — أنا 😄

🎯 إزاي تعرض موهبتك في المنصة:
1. من القائمة الجانبية، اضغط على "موهبتي"
2. اضغط زر "ارفع موهبتك"
3. اكتب عنوان الموهبة
4. اختر النوع (برمجة، رسم، تصميم، كتابة، إلخ)
5. اكتب وصف مختصر
6. حط رابط لشغلك (اختياري)
7. اضغط "رفع الموهبة"
8. زمايلك هيعملوا لايك على موهبتك!

📋 معلومات السياق:
${JSON.stringify(context, null, 2)}

⚠️ قواعد مهمة:
- جاوب في 3-5 سطور بحد أقصى
- لو مش عارف حاجة عن المنصة، قول: "معلش، اسأل الإدارة."
- متخترعش معلومات من عندك
- ركّز على خدمات المنصة`;
    // نستخدم Groq
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq error:", errText);
      return NextResponse.json(
        { error: `خطأ Groq: ${groqRes.status}` },
        { status: 500 }
      );
    }

    const groqData = await groqRes.json();
    const reply =
      groqData.choices?.[0]?.message?.content || "معلش، مش عارف أرد.";

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error("=== AI ERROR ===");
    console.error("Message:", error?.message);
    return NextResponse.json(
      { error: `خطأ: ${error?.message || "غير معروف"}` },
      { status: 500 }
    );
  }
}