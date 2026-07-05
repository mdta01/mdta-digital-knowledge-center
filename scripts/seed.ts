/**
 * Seed script — populates the database with sample categories, authors, books,
 * and an initial super admin so the demo is immediately usable.
 *
 * Run: bun /home/z/my-project/scripts/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("→ Seeding…");

  // ---------- Admin ----------
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@mdta-miftahululum.sch.id" },
  });
  if (!existingAdmin) {
    const password = await bcrypt.hash("admin12345", 10);
    await prisma.user.create({
      data: {
        email: "admin@mdta-miftahululum.sch.id",
        password,
        name: "Super Admin",
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
    console.log("✓ Created super admin: admin@mdta-miftahululum.sch.id / admin12345");
  }

  // ---------- Categories ----------
  const categories = [
    { name: "Aqidah", slug: "aqidah", icon: "Heart", description: "Ilulu tentang ketauhidan dan rukun iman." },
    { name: "Akhlak", slug: "akhlak", icon: "Sparkles", description: "Pembinaan akhlak dan budi pekerti Islami." },
    { name: "Fiqih", slug: "fiqih", icon: "Scale", description: "Hukum-hukum syariat dan ibadah praktis." },
    { name: "Tafsir", slug: "tafsir", icon: "BookOpen", description: "Tafsir Al-Qur'an dan ulumul Qur'an." },
    { name: "Hadits", slug: "hadits", icon: "Scroll", description: "Ilmu hadits dan syarahnya." },
    { name: "Tajwid", slug: "tajwid", icon: "AudioLines", description: "Ilmu tajwid dan bacaan Al-Qur'an." },
    { name: "Bahasa Arab", slug: "bahasa-arab", icon: "Languages", description: "Pembelajaran tata bahasa Arab." },
    { name: "Sirah Nabawiyah", slug: "sirah-nabawiyah", icon: "Moon", description: "Sejarah dan perjalanan hidup Nabi." },
    { name: "Doa", slug: "doa", icon: "HandHeart", description: "Kumpulan doa harian dan munajat." },
    { name: "Umum", slug: "umum", icon: "Library", description: "Buku-buku keislaman umum." },
  ];
  const catRecords = [];
  for (const c of categories) {
    const rec = await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, description: c.description },
    });
    catRecords.push(rec);
  }
  console.log(`✓ ${catRecords.length} categories`);

  // ---------- Authors ----------
  const authors = [
    { name: "Imam Al-Ghazali", slug: "imam-al-ghazali", bio: "Teolog, ahli hukum, dan filsuf Islam terkenal.", nationality: "Persia", birthYear: 1058, deathYear: 1111 },
    { name: "Imam Nawawi", slug: "imam-nawawi", bio: "Ahli hukum Syafi'i dan ahli hadits terkemuka.", nationality: "Suriah", birthYear: 1233, deathYear: 1277 },
    { name: "Imam Asy-Syafi'i", slug: "imam-asy-syafii", bio: "Pendiri mazhab Syafi'i dalam fiqih Islam.", nationality: "Palestina", birthYear: 767, deathYear: 820 },
    { name: "Ibnu Katsir", slug: "ibnu-katsir", bio: "Ahli tafsir dan sejarawan Islam terkenal.", nationality: "Suriah", birthYear: 1301, deathYear: 1373 },
    { name: "Hidayatullah, KH.", slug: "kh-hidayatullah", bio: "Ulama Indonesia, pengasuh pesantren modern.", nationality: "Indonesia", birthYear: 1950 },
  ];
  const authorRecords = [];
  for (const a of authors) {
    const rec = await prisma.author.upsert({
      where: { slug: a.slug },
      create: a,
      update: a,
    });
    authorRecords.push(rec);
  }
  console.log(`✓ ${authorRecords.length} authors`);

  // ---------- Books ----------
  const books = [
    {
      title: "Ihya Ulumuddin",
      slug: "ihya-ulumuddin",
      description: "Mahakarya Imam Al-Ghazali yang membahas revitalisasi ilmu-ilmu agama.",
      content: `<h2>Muqaddimah</h2><p>Kitab <em>Ihya Ulumuddin</em> adalah salah satu karya monumental Imam Al-Ghazali yang membahas seluruh aspek kehidupan seorang muslim — mulai dari ibadah, muamalah, akhlak, hingga tasawuf.</p><p>Kitab ini terbagi dalam empat rubu' (kuartal): Rubu' al-Ibadat, Rubu' al-Adat, Rubu' al-Muhlikat, dan Rubu' al-Munjiyat.</p><blockquote>"Ilmu tanpa amal adalah gila, dan amal tanpa ilmu tidak akan sempurna." — Imam Al-Ghazali</blockquote><h2>Bab Pertama: Kitab al-Ilmi</h2><p>Pada bab ini, beliau membahas keutamaan ilmu, tugas-tugas seorang penuntut ilmu, serta adab-adab dalam menuntut ilmu.</p>`,
      pages: 1600,
      language: "ar",
      publishedYear: 1100,
      publisher: "Dar al-Kutub al-Ilmiyyah",
      status: "PUBLISHED",
      featured: true,
      isbn: "978-977-09-1234-5",
      categoryName: "Aqidah",
      authorName: "Imam Al-Ghazali",
    },
    {
      title: "Arba'in An-Nawawi",
      slug: "arbain-an-nawawi",
      description: "Kumpulan 42 hadits pilihan Imam Nawawi yang merangkum pokok-pokok agama.",
      content: `<h2>Muqaddimah</h2><p>Kitab <strong>Arba'in An-Nawawi</strong> berisi 42 hadits pilihan yang merangkum pokok-pokok agama Islam, dikumpulkan oleh Imam Nawawi.</p><h2>Hadits Pertama</h2><blockquote dir="rtl">إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى</blockquote><p>"Sesungguhnya amal itu tergantung niatnya, dan setiap orang akan mendapatkan apa yang ia niatkan." (HR. Bukhari & Muslim)</p>`,
      pages: 120,
      language: "ar",
      publishedYear: 1270,
      publisher: "Dar al-Minhaj",
      status: "PUBLISHED",
      featured: true,
      categoryName: "Hadits",
      authorName: "Imam Nawawi",
    },
    {
      title: "Tafsir Ibnu Katsir",
      slug: "tafsir-ibnu-katsir",
      description: "Tafsir Al-Qur'an yang merujuk pada ayat, hadits, dan atsar sahabat.",
      content: `<h2>Muqaddimah</h2><p><em>Tafsir Ibnu Katsir</em> adalah salah satu tafsir paling otoritatif dalam tradisi Sunni, yang menafsarkan Al-Qur'an dengan Al-Qur'an, Al-Qur'an dengan Sunnah, dan Sunnah dengan atsar sahabat.</p>`,
      pages: 2400,
      language: "ar",
      publishedYear: 1370,
      publisher: "Dar Thayyibah",
      status: "PUBLISHED",
      featured: false,
      categoryName: "Tafsir",
      authorName: "Ibnu Katsir",
    },
    {
      title: "Tajwid Muqaddimah Jazariyah",
      slug: "tajwid-jazariyah",
      description: "Matan Al-Jazariyah berisi ilmu tajwid dasar untuk pemula.",
      content: `<h2>Muqaddimah</h2><p>Matan <strong>Al-Muqaddimah Al-Jazariyah</strong> adalah syair berisi kaidah-kaidah tajwid yang disusun oleh Imam Ibnu al-Jazari.</p><blockquote dir="rtl">يَقُولُ رَاجِي عَفْوِ رَبٍّ صَادِقٍ * مُحَمَّدُ بْنُ الْجَزَرِيِّ الْوَارِثُ</blockquote>`,
      pages: 60,
      language: "ar",
      publishedYear: 1420,
      publisher: "Dar al-Minhaj",
      status: "PUBLISHED",
      featured: false,
      categoryName: "Tajwid",
      authorName: "Imam Nawawi",
    },
    {
      title: "Sirah Nabawiyah untuk Pelajar",
      slug: "sirah-nabawiyah-pelajar",
      description: "Buku pengantar sejarah Nabi Muhammad SAW untuk pelajar diniyah.",
      content: `<h2>Pendahuluan</h2><p>Buku ini disusun sebagai pengantar bagi pelajar diniyah untuk mengenal perjalanan hidup Rasulullah SAW dari kelahiran hingga wafat.</p><h2>Bab 1: Kelahiran Nabi</h2><p>Nabi Muhammad SAW lahir di Makkah pada Tahun Gajah, tanggal 12 Rabi'ul Awwal. Ayahnya Abdullah wafat sebelum beliau lahir.</p>`,
      pages: 280,
      language: "id",
      publishedYear: 2020,
      publisher: "MDTA MIFTAHUL ULUM",
      status: "PUBLISHED",
      featured: true,
      categoryName: "Sirah Nabawiyah",
      authorName: "Hidayatullah, KH.",
    },
    {
      title: "Fiqih Ibadah Praktis",
      slug: "fiqih-ibadah-praktis",
      description: "Panduan praktis fiqih ibadah sehari-hari untuk muslim awam.",
      content: `<h2>Pendahuluan</h2><p>Buku ini membahas fiqih ibadah praktis mencakup bersuci, salat, zakat, puasa, dan haji.</p><h2>Bab 1: Thaharah</h2><p>Thaharah (bersuci) adalah kunci sahnya ibadah. Mempelajari hukum-hukumnya wajib bagi setiap mukallaf.</p>`,
      pages: 320,
      language: "id",
      publishedYear: 2021,
      publisher: "MDTA MIFTAHUL ULUM",
      status: "PUBLISHED",
      featured: false,
      categoryName: "Fiqih",
      authorName: "Hidayatullah, KH.",
    },
  ];
  for (const b of books) {
    const cat = catRecords.find((c) => c.name === b.categoryName)!;
    const auth = authorRecords.find((a) => a.name === b.authorName)!;
    await prisma.book.upsert({
      where: { slug: b.slug },
      create: {
        title: b.title,
        slug: b.slug,
        description: b.description,
        content: b.content,
        pages: b.pages,
        language: b.language,
        publishedYear: b.publishedYear,
        publisher: b.publisher,
        status: b.status,
        featured: b.featured,
        isbn: b.isbn,
        categoryId: cat.id,
        authorId: auth.id,
        views: Math.floor(Math.random() * 500) + 50,
      },
      update: {},
    });
  }
  console.log(`✓ ${books.length} books`);

  // ---------- Pages ----------
  const pages = [
    {
      title: "Tentang Kami",
      slug: "about",
      content: `<h2>Profil MDTA MIFTAHUL ULUM 01</h2><p>Madrasah Diniyah Takmiliyah Awaliyah MIFTAHUL ULUM 01 adalah lembaga pendidikan keagamaan yang berkomitmen mencetak generasi muslim berakhlak qur'ani.</p><p>Berdiri sejak puluhan tahun lalu, lembaga ini terus berkembang dengan menghadirkan pendidikan yang memadukan tradisi keilmuan klasik dengan pendekatan modern.</p>`,
      status: "PUBLISHED",
    },
    {
      title: "Kebijakan Privasi",
      slug: "privacy",
      content: `<h2>Kebijakan Privasi</h2><p>Perpustakaan Digital MDTA MIFTAHUL ULUM 01 menghormari privasi pengunjung. Kami tidak mengumpulkan data pribadi tanpa persetujuan.</p><p>Data kontak yang Anda kirimkan melalui form kontak hanya digunakan untuk merespons pertanyaan Anda.</p>`,
      status: "PUBLISHED",
    },
    {
      title: "Syarat Penggunaan",
      slug: "terms",
      content: `<h2>Syarat Penggunaan</h2><p>Dengan mengakses perpustakaan digital ini, Anda menyetujui syarat berikut:</p><ul><li>Konten hanya untuk tujuan pembelajaran.</li><li>Dilarang menyalahgunakan atau mendistribusikan ulang tanpa izin.</li><li>Sumber harus dicantumkan saat mengutip materi.</li></ul>`,
      status: "PUBLISHED",
    },
  ];
  for (const p of pages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      create: p,
      update: {},
    });
  }
  console.log(`✓ ${pages.length} pages`);

  // ---------- Settings ----------
  const settings = [
    { key: "site.name", value: JSON.stringify("Perpustakaan Digital MDTA MIFTAHUL ULUM 01") },
    { key: "site.description", value: JSON.stringify("Perpustakaan Digital Islami Modern — Koleksi kitab, modul pembelajaran, dan buku diniyah.") },
    { key: "site.footer", value: JSON.stringify("© {year} MDTA MIFTAHUL ULUM 01. Hak cipta dilindungi.") },
    { key: "contact.address", value: JSON.stringify("Jl. Pendidikan No. 01, Desa Miftahul Ulum, Kec.camatan, Kabupaten, Jawa Tengah, Indonesia 52181") },
    { key: "contact.whatsapp", value: JSON.stringify("+62 812-3456-7890") },
    { key: "contact.email", value: JSON.stringify("info@mdta-miftahululum.sch.id") },
    { key: "contact.maps_url", value: JSON.stringify("https://www.google.com/maps?q=-7.5,110.2&z=15&output=embed") },
    { key: "social.facebook", value: JSON.stringify("https://facebook.com/mdta.miftahululum") },
    { key: "social.instagram", value: JSON.stringify("https://instagram.com/mdta.miftahululum") },
    { key: "social.youtube", value: JSON.stringify("https://youtube.com/@mdta-miftahululum") },
    { key: "content.islamic_quote", value: JSON.stringify("Barangsiapa menempuh jalan untuk mencari ilmu, Allah akan memudahkan baginya jalan menuju surga.") },
    { key: "content.quote_author", value: JSON.stringify("HR. Muslim dari Abu Hurairah") },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      create: { key: s.key, value: s.value, type: "json" },
      update: { value: s.value },
    });
  }
  console.log(`✓ ${settings.length} settings`);

  console.log("✓ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
