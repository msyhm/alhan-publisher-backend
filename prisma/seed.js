/**
 * seed.js
 * ─────────────────────────────────────────────────────────────────────────
 * داده اولیه دیتابیس انتشارات الحان
 * مسیر فایل: prisma/seed.js
 *
 * اجرا:
 *   npm run prisma:seed
 *   یا: node prisma/seed.js
 *
 * ✅ ایمن برای اجرای چندباره — هر بار چک می‌کند داده وجود دارد یا نه
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// ─── داده‌های اولیه ────────────────────────────────────────────────────────

const ADMIN = {
  username: process.env.ADMIN_DEFAULT_USERNAME || "admin",
  password: process.env.ADMIN_DEFAULT_PASSWORD || "Admin@1234",
};

const AUTHORS = [
  {
    name:   "دکتر علی مراد حیدری",
    email:  null,
    phone:  null,
    field:  "حقوق",
    bio:    "دانشیار حقوق دانشگاه فردوسی مشهد",
    status: "ACTIVE",
  },
];

const BOOKS = [
  {
    title:         "حقوق تجارت",
    authorName:    "دکتر علی مراد حیدری",   // با این مقدار به Author وصل می‌شود
    description:   "معرفی کتاب حقوق تجارت — این کتاب پوشش جامعی از مباحث حقوق تجارت ارائه می‌دهد.",
    category:      "حقوق",
    pages:         320,
    year:          1404,
    isAudio:       false,
    image:         null,
    price:         null,
    isbn:          null,
    edition:       "اول",
    publisherCity: "قم",
  },
];

const SITE_SETTINGS = [
  {
    key: "general",
    value: {
      publisherName:       "انتشارات",
      publisherNameAccent: "الحان",
      logoLetter:          "آ",
      slogan:              "ناشر آثار علمی، دانشگاهی و فرهنگی با هدف ارتقای دانش و فرهنگ در جامعه",
      foundingYear:        "۱۳۹۸",
      publishLicense:      "۱۴۹۳۳",
    },
  },
  {
    key: "hero",
    value: {
      heroSubtitle:  "ناشر آثار علمی، دانشگاهی، فرهنگی و ادبی با هدف ارتقای دانش و فرهنگ در جامعه",
      heroStat1Label: "سال فعالیت",
      heroStat2Label: "کتاب منتشر شده",
      heroStat3Label: "نویسنده همکار",
      featuredBookId: null,
    },
  },
  {
    key: "contact",
    value: {
      address:  "قم، زنبیل‌آباد، ۳۰ متری قائم، پلاک ۱۸۳",
      phone:    "۰۲۵-۳۲۷۰۱۱۲۶",
      phoneRaw: "02532701126",
      email:    "alhannasher@gmail.com",
    },
  },
  {
    key: "social",
    value: {
      instagram: "https://instagram.com/AlhanPublish",
      telegram:  "https://t.me/AlhanPublish",
    },
  },
  {
    key: "about",
    value: {
      aboutText: "انتشارات الحان با هدف انتشار آثار علمی، دانشگاهی و فرهنگی فعالیت می‌کند.",
      vision:    "تبدیل به یکی از برترین ناشران علمی",
      mission:   "انتشار آثار ارزشمند و ارتقای دانش",
      values:    "اصالت، کیفیت و نوآوری",
    },
  },
  {
    key: "universities",
    value: [
      { id: 1, name: "دانشگاه تهران",                            logo: "" },
      { id: 2, name: "دانشگاه فردوسی مشهد",                     logo: "" },
      { id: 3, name: "دانشگاه حضرت معصومه (ع)",                  logo: "" },
      { id: 4, name: "دانشگاه قم",                               logo: "" },
      { id: 5, name: "دانشگاه حکیم سبزواری",                     logo: "" },
      { id: 6, name: "مجتمع آموزش عالی فنی و مهندسی اسفراین",   logo: "" },
      { id: 7, name: "دانشگاه آزاد اسلامی",                      logo: "" },
      { id: 8, name: "دانشگاه پیام نور",                         logo: "" },
    ],
  },
];

// ─── توابع seed ──────────────────────────────────────────────────────────────

async function seedAdmin() {
  const existing = await prisma.admin.findUnique({
    where: { username: ADMIN.username },
  });

  if (existing) {
    console.log("  ↳ ادمین از قبل وجود دارد — رد شد");
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN.password, 12);
  await prisma.admin.create({
    data: { username: ADMIN.username, passwordHash },
  });
  console.log(`  ↳ ادمین ساخته شد: ${ADMIN.username}`);
  console.log("  ⚠️  حتماً پسورد پیش‌فرض را از پنل تغییر دهید!");
}

async function seedAuthors() {
  let created = 0;
  for (const author of AUTHORS) {
    const existing = author.email
      ? await prisma.author.findUnique({ where: { email: author.email } })
      : await prisma.author.findFirst({ where: { name: author.name } });

    if (existing) {
      console.log(`  ↳ نویسنده "${author.name}" از قبل وجود دارد — رد شد`);
      continue;
    }

    await prisma.author.create({ data: author });
    created++;
    console.log(`  ↳ نویسنده ساخته شد: ${author.name}`);
  }
  return created;
}

async function seedBooks() {
  let created = 0;
  for (const book of BOOKS) {
    const existing = await prisma.book.findFirst({ where: { title: book.title } });

    if (existing) {
      console.log(`  ↳ کتاب "${book.title}" از قبل وجود دارد — رد شد`);
      continue;
    }

    // پیدا کردن نویسنده بر اساس نام
    const author = await prisma.author.findFirst({
      where: { name: book.authorName },
    });

    await prisma.book.create({
      data: {
        ...book,
        authorName: undefined,        // این فیلد موقت است
        authorId:   author?.id || null,
        authorName: book.authorName,  // ذخیره هم به صورت متن
      },
    });
    created++;
    console.log(`  ↳ کتاب ساخته شد: ${book.title}`);
  }
  return created;
}

async function seedSettings() {
  let created = 0;
  for (const setting of SITE_SETTINGS) {
    await prisma.siteSetting.upsert({
      where:  { key: setting.key },
      update: {},                    // اگر وجود دارد دست نزن
      create: setting,
    });
    console.log(`  ↳ تنظیمات "${setting.key}" ذخیره شد`);
    created++;
  }
  return created;
}

// ─── اجرای اصلی ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 شروع seed دیتابیس انتشارات الحان...\n");

  console.log("👤 ادمین:");
  await seedAdmin();

  console.log("\n✍️  نویسندگان:");
  await seedAuthors();

  console.log("\n📚 کتاب‌ها:");
  await seedBooks();

  console.log("\n⚙️  تنظیمات سایت:");
  await seedSettings();

  console.log("\n✅ Seed با موفقیت انجام شد!");
}

main()
  .catch((err) => {
    console.error("❌ خطا در seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
