// scripts/generate-parents.js
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
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

// ✅ توليد كلمة سر عشوائية (8 حروف وأرقام)
function generatePassword(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ✅ توليد كود ولي الأمر
function generateParentCode(index) {
  const num = String(index).padStart(4, "0");
  return `HWG-PAR-${num}`;
}

// ✅ رفع أولياء الأمور
async function uploadParents() {
  const TOTAL = 1000;
  const BATCH_SIZE = 100;

  console.log(`\n👨‍👩‍👧 جاري توليد ${TOTAL} حساب لولي الأمر...`);

  const parents = [];
  for (let i = 1; i <= TOTAL; i++) {
    parents.push({
      code: generateParentCode(i),
      password: generatePassword(),
      role: "parent",
      profile_completed: true,
      status: "active",
    });
  }

  // رفع في دفعات
  let uploaded = 0;
  for (let i = 0; i < parents.length; i += BATCH_SIZE) {
    const batch = parents.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("users").insert(batch);

    if (error) {
      console.error(`❌ خطأ في الدفعة ${i / BATCH_SIZE + 1}:`, error.message);
      continue;
    }

    uploaded += batch.length;
    console.log(`✅ تم رفع ${uploaded} / ${TOTAL} ولي أمر`);
  }

  // ✅ نحفظهم في ملف Excel عشان الإدارة
  const wsData = [
    ["الكود", "كلمة السر", "النوع"],
    ...parents.map((p) => [p.code, p.password, "ولي أمر"]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "الحسابات");
  const outputPath = path.join(__dirname, "..", "parents.xlsx");
  XLSX.writeFile(wb, outputPath);

  console.log(`\n📁 تم حفظ الأكواد في: ${outputPath}`);
  return uploaded;
}

// التشغيل
async function main() {
  console.log("🚀 بدء رفع أولياء الأمور على Supabase...");
  console.log(`📡 الاتصال بـ: ${supabaseUrl}`);

  const count = await uploadParents();

  console.log("\n🎉 اكتمل الرفع!");
  console.log(`📊 الإجمالي: ${count} حساب`);
}

main().catch((err) => {
  console.error("❌ خطأ عام:", err);
  process.exit(1);
});