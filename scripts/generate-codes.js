// scripts/upload-users.js
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// تحميل الـ ENV يدويًا
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");

const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join("=").trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ مفاتيح Supabase مش موجودة في .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// قراءة ملف Excel
function readExcel(fileName) {
  const filePath = path.join(__dirname, "..", fileName);
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

// رفع الطلاب
async function uploadStudents() {
  console.log("\n👨‍🎓 جاري رفع الطلاب...");
  const students = readExcel("students.xlsx");

  const users = students.map((s) => ({
    code: s["الكود"],
    password: s["كلمة السر"],
    role: "student",
    profile_completed: false,
    status: "active",
  }));

  // رفع في دفعات (كل دفعة 100)
  const batchSize = 100;
  let uploaded = 0;

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const { data, error } = await supabase.from("users").insert(batch);

    if (error) {
      console.error(`❌ خطأ في الدفعة ${i / batchSize + 1}:`, error.message);
      continue;
    }

    uploaded += batch.length;
    console.log(`✅ تم رفع ${uploaded} / ${users.length} طالب`);
  }

  return uploaded;
}

// رفع المدرسين
async function uploadTeachers() {
  console.log("\n👨‍🏫 جاري رفع المدرسين...");
  const teachers = readExcel("teachers.xlsx");

  const users = teachers.map((t) => ({
    code: t["الكود"],
    password: t["كلمة السر"],
    role: "teacher",
    profile_completed: false,
    status: "active",
  }));

  const { data, error } = await supabase.from("users").insert(users);

  if (error) {
    console.error("❌ خطأ:", error.message);
    return 0;
  }

  console.log(`✅ تم رفع ${users.length} مدرس`);
  return users.length;
}

// التشغيل
async function main() {
  console.log("🚀 بدء رفع الحسابات على Supabase...");
  console.log(`📡 الاتصال بـ: ${supabaseUrl}`);

  const studentsCount = await uploadStudents();
  const teachersCount = await uploadTeachers();

  console.log("\n🎉 اكتمل الرفع!");
  console.log(`📊 الإجمالي: ${studentsCount + teachersCount} حساب`);
}

main().catch((err) => {
  console.error("❌ خطأ عام:", err);
  process.exit(1);
});