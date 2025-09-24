# Çocuk Bahçem — Proje Spesifikasyonu

**Özet:**
Bu doküman, `Çocuk Bahçem` adlı Türkçe blog projesinin kodlama ajanına verilecek tam bir teknik gereksinim, dosya yapısı, SEO/metadata formatı, admin panel davranışları ve UI/UX rehberi içerir. Proje Vite ile geliştirilecek ve Clean Architecture prensiplerine uygun olacaktır. Mobil öncelikli (mobile-first), erişilebilir ve estetik bir tasarım hedeflenir.

---

## Hedefler

* **Basit içerik yazarak** (`articles/{kategori}` içine Markdown/HTML dosyası koyarak) siteye içerik ekleyebilme.
* Her makale için **SEO-ready** bir JSON metadata dosyası oluşturma/gösterme/kopyala-yapıştır için hazır sunma.
* **Admin panel** ile makale oluşturma, preview, SEO bilgileri girme, SEO skorunu gösterme ve `indir` (export) butonu ile içerik paketini indirme.
* **Clean Architecture** ile ayrılmış katmanlar: UI, Application, Domain, Infrastructure.
* **Vite** tabanlı modern frontend (React + TypeScript önerilir) + Tailwind CSS (veya istenirse başka CSS yöntemi).

---

## Önerilen Teknoloji Yığını

* Framework: **React 18 + Vite + TypeScript**
* Styling: **Tailwind CSS** (hızlı, mobile-first için ideal)
* State management: local state veya **Zustand** (hafif) — admin form için formik veya react-hook-form
* Routing: **React Router** veya **Wouter**
* Build/export: Vite `build` + küçük bir export utility (frontend içinde zip üretimi veya backendless ağsız export)
* Authentication (admin): Basit fakat güvenli route-protection — **statik JWT** veya **env şifre** ile localhost'ta çalışan admin (prod için OAuth, Netlify Identity, Auth0 vb. önerilir)
* Lint/Format: ESLint + Prettier + Husky (pre-commit)
* Test: React Testing Library + Vitest

> Not: Coding agent'a daha ileri seviye deployment istenirse Netlify / Vercel entegrasyonu veya GitHub Pages (statik) tavsiye edilir.

---

## Clean Architecture — Katmanlar (Frontend odaklı)

* **Presentation / UI**

  * React komponentleri, sayfalar, komponentler (ArticleList, ArticleCard, ArticleEditor)
* **Application**

  * Use-cases: `CreateArticle`, `ValidateSeo`, `ExportArticleBundle`, `GetArticleMetadata`
* **Domain**

  * Entity'ler: `Article`, `SeoMetadata`
  * Value Objects: `Category`, `ImageRef`
* **Infrastructure**

  * File system adapter (dev: `articles/` klasörünü okuyup yazan mock adapter), localStorage veya IndexedDB adapter (admin session), ZIP exporter

---

## Proje Dosya & Klasör Yapısı (Örnek)

```
chocuk-bahcem/
├─ public/
│  └─ assets/             # genel statik dosyalar
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ pages/
│  │  ├─ HomePage.tsx
│  │  ├─ ArticlePage.tsx
│  │  └─ AdminPage.tsx
│  ├─ components/
│  │  ├─ ArticleCard.tsx
│  │  ├─ SeoScoreMeter.tsx
│  │  └─ EditorPreview.tsx
│  ├─ domain/
│  │  ├─ entities/Article.ts
│  │  └─ valueObjects/Category.ts
│  ├─ application/
│  │  ├─ usecases/CreateArticle.ts
│  │  └─ usecases/ExportArticle.ts
│  ├─ infrastructure/
│  │  ├─ adapters/FileAdapterLocal.ts
│  │  ├─ adapters/ZipExporter.ts
│  │  └─ adapters/AuthAdapter.ts
│  └─ styles/
├─ articles/
│  ├─ pregnancy/
│  │  └─ 2025-09-01-beslenme-ve-dogum.md
│  ├─ babies/
│  └─ family/
├─ seo-json/               # build sırasında veya admin tarafından oluşturulan json'lar
│  └─ 2025-09-01-beslenme-ve-dogum.json
├─ vite.config.ts
├─ package.json
└─ README.md
```

> **articles/** dizini: Her kategori için alt klasör (pregnancy, babies, family, tips vb.) ve her makale Markdown (`.md`), HTML veya doğrudan `.json` içerebilir. Dev aşamasında frontend, `FileAdapterLocal` ile bu klasörü okuyacak (development only). Prod için bu dosyalar repository'e eklenir veya CMS'e taşınır.

---

## Makale Dosya Formatı (Örnek `.md`)

`articles/pregnancy/2025-09-01-beslenme-ve-dogum.md`

```md
---
title: "Hamilelikte Beslenme ve Doğum Hazırlığı"
date: 2025-09-01
category: pregnancy
previewImage: /assets/images/pregnancy-food.jpg
tags: [beslenme, hamilelik, doğum]
---

Giriş paragrafı...

## Başlık 1

Makale içeriği...
```

---

## Metadata JSON Şeması (SEO-ready)

Admin panelinden "Kaydet" yapıldığında veya build sürecinde üretilen JSON örneği:

```json
{
  "slug": "2025-09-01-beslenme-ve-dogum",
  "title": "Hamilelikte Beslenme ve Doğum Hazırlığı",
  "date": "2025-09-01",
  "category": "pregnancy",
  "previewImage": "/assets/images/pregnancy-food.jpg",
  "description": "Hamilelik döneminde doğru beslenme ve doğuma hazırlık için pratik öneriler.",
  "tags": ["beslenme","hamilelik","doğum"],
  "readingTime": 6,
  "seo": {
    "metaTitle": "Hamilelikte Beslenme | Çocuk Bahçem",
    "metaDescription": "Hamilelik döneminde doğru beslenme ve doğuma hazırlık için pratik öneriler.",
    "canonical": "https://cocukbahcem.example/pregnancy/2025-09-01-beslenme-ve-dogum",
    "ogImage": "/assets/images/pregnancy-food-og.jpg",
    "twitterCard": "summary_large_image",
    "keywords": ["hamilelik","beslenme","doğum hazirligi"]
  },
  "seoScore": 82
}
```

**Açıklama:** `seoScore` admin panelindeki analiz fonksiyonundan gelir.

---

## SEO Skoru Hesaplama (Basit Mantık)

Ajanın uygulayabileceği, basit ve deterministik bir skor fonksiyonu (0-100):

* Meta title uygunluğu (15 puan)

  * 30–60 karakter arası olursa tam puan.
* Meta description uzunluğu (15 puan)

  * 120–160 karakter arası tam puan.
* H1 başlık var mı? (10 puan)
* Görsel `alt` metinleri mevcut mu? (10 puan)
* Keywords başlık/description içinde geçiyor mu? (15 puan)
* İçerik uzunluğu (kelime sayısı) (10 puan)

  * 400+ kelime tam puan, 200-400 arası yarı puan.
* Structured Data / JSON-LD (10 puan)
* Canonical ve og\:image ayarlı mı? (10 puan)

Her öğe puanlanır ve toplam 100'e ölçeklenir. Admin ekranında `SeoScoreMeter` bileşeni ile görsel gösterim gerekir.

---

## Admin Panel Özellikleri

* **Giriş**: Tek kullanıcılı, parola ile korunan. (Geliştirme: `REACT_APP_ADMIN_PASSWORD` env variable; prod: OAuth veya daha güvenli çözüm)

* **Makale Editörü**:

  * Başlık, Tarih (otomatik/elle), Kategori (dropdown), İçerik (Markdown editör - tip: `react-markdown` + `react-mde` veya `@uiw/react-md-editor`).
  * Preview Image seçimi (dosya yükle veya public assets seçici).
  * SEO alanları: metaTitle, metaDescription, canonical, ogImage, keywords.
  * `Preview` butonu: sol/sağ split preview.
  * `Kaydet` butonu: article dosyasını (`.md`) ve metadata JSON'u oluşturur ve kullanıcıya ZIP olarak indirir veya doğrudan `articles/` klasörüne kaydeder (dev).
  * `SEO Skoru` gösterimi ve öneriler (ör: "metaDescription kısa, 45 karakter daha ekleyin").
  * `Kopyala JSON` butonu: metadata JSON'u kopyala-panoya kopyalar.

* **Güvenlik:** Admin panel route'u sadece oturum açınca görünür (router guard). LocalStorage'da kısa ömürlü token saklanabilir.

---

## Export / İndir İş Akışı

1. Admin `Kaydet` butonuna basar.
2. Uygulama: Markdown içeriği + metadata JSON oluşturur.
3. `ZipExporter` adapter: aşağıdaki dosya yapısını içeren zip üretir:

```
slug/
  article.md
  meta.json
  preview.jpg (opsiyonel)
```

4. Tarayıcıda dosya otomatik indirilmeli. (Kütüphane: `jszip` + `file-saver`)
5. Kullanıcı bu zip'i açıp projenin `articles/` dizinine koyabilir veya repo'ya commit edebilir.

---

## UI/UX Tasarım Rehberi (Estetik & Modern)

* **Tema:** Yumuşak pastel tonlar, çocuk/ebeveyn duygusunu çağıran sıcak renk paleti. (ör: pastel sarı, açık yeşil, açık turkuaz, krem arka plan.)
* **Tipografi:** Başlıklar için hafif yuvarlak Sans-serif (örn. Inter / Poppins), gövde metni için okunaklı bir font (Inter).
* **Kartlar:** Hafif gölgeler, yuvarlatılmış köşeler, p-4..p-6 padding, estetik ikonlar.
* **Mobile-first:** Küçük cihazlarda tek sütun; geniş ekranlarda grid ile 2–3 sütun.
* **Erişilebilirlik:** Kontrast oranları, `alt` metin zorunlu, semantik HTML.
* **Animasyonlar:** Hafif, hoş geçişler (Framer Motion önerisi) — buton hover, kart hover.

### Komponentler

* `Header` (logo, kategori menüsü, arama ikonu)
* `Hero` (featured article carousel)
* `ArticleCard` (resim, kategori etiketi, title, excerpt, readingTime)
* `Footer` (hakkında, iletişim, sosyal medya)
* `AdminEditor` (form + preview)

---

## Responsive Breakpoints (Tailwind varsayımları)

* **sm**: 640px
* **md**: 768px
* **lg**: 1024px
* **xl**: 1280px

Mobile-first yaklaşımla bileşenler küçük ekranda bir sütun halinde başlayacak.

---

## Geliştirme/Çalışma Adımları (Coding Agent için Madde Madde)

1. Vite + React + TypeScript iskeleti oluştur.
2. Tailwind kurulumu ve global tema ayarları.
3. Clean Architecture klasör yapısını oluştur.
4. `articles/` klasörünü ve örnek kategori/makale ekle.
5. File Adapter (dev): `src/infrastructure/adapters/FileAdapterLocal.ts` — `articles/` klasörünü read-only olarak okuyup JSON metadata üretir (development only).
6. UI: HomePage, ArticlePage, AdminPage iskeletleri.
7. Markdown render: `react-markdown` + `rehype-sanitize`.
8. Admin Editor: react-hook-form, markdown editor, image picker, SEO alanları.
9. SeoScoreMeter: yukarıdaki kurala göre puanlama fonksiyonu.
10. Export: `jszip` ile zip oluşturma ve `file-saver` ile indirme.
11. Routing ve authentication guard.
12. Tests: birkaç bileşen testi ve usecase testi.
13. Lint/format ve bir `README.md` yaz.

---

## Acceptance Criteria (Kabul Kriterleri)

* `HomePage` ana sayfa; kategori filtreleme, article list görüntüleniyor.
* `ArticlePage` seçilen makaleyi Markdown olarak düzgün render ediyor ve `meta.json` verilerini sayfada gösteriyor.
* `AdminPage` ile yeni makale oluşturulabiliyor; preview görüntülenebiliyor; `Kaydet` ile ZIP indiriliyor; kaydedilen JSON kopyalanabiliyor.
* `SeoScore` hesaplanıp gösteriliyor ve en az basit öneriler veriliyor.
* Site responsive ve temel accessibility kriterlerini paslıyor.

---

## Örnek `meta.json` Kopyala İçin Ekranda Gösterilecek Format

Admin panelinin sağında gösterilecek "Kopyala / Panoya Kopyala" alanı için: tek satırda güzel formatlanmış JSON (pretty) gösterilecek. Örnek:

```json
{
  "slug": "2025-09-01-beslenme-ve-dogum",
  "title": "Hamilelikte Beslenme ve Doğum Hazırlığı",
  "category": "pregnancy",
  "previewImage": "/assets/images/pregnancy-food.jpg",
  "description": "Hamilelik döneminde doğru beslenme...",
  "seo": { "metaTitle": "...", "metaDescription": "..." },
  "seoScore": 82
}
```

---

## Güvenlik & Prod Önerileri

* Admin kimlik doğrulaması için üçüncü parti kimlik sağlayıcı (Auth0, Netlify Identity, NextAuth vb.) kullan.
* `articles/` içeriklerini repo içinde tutun veya headless CMS (Sanity, Strapi, Netlify CMS) kullanın.
* Preview image yüklemeleri için S3/Cloud Storage veya deploy edilen public assets dizini kullanılmalı.

---

## CI / Deployment (Kısa)

* `npm run build` ile statik dosyalar üret.

---

## Ek Notlar & İstenen Teslimler (Coding Agent'a verilecek)

* Tam çalışan Vite projesi (repo) — `main` branch'te clean commit history.
* `README.md` — kurulum, çalıştırma, admin parola nasıl ayarlanır, nasıl içerik eklenir adımları.
* Demo içerik: en az 3 makale (farklı kategorilerde) ve bunlara ait `meta.json` örnekleri.
* Bir adet `export` senaryosu test edilmiş (zip indirme çalışıyor).

---

## Hızlı Checklist (Task list for agent)

* [ ] Vite + React + TypeScript proje kurulumu
* [ ] Tailwind kurulumu
* [ ] Clean Architecture klasörleri
* [ ] HomePage, ArticlePage, AdminPage
* [ ] Markdown renderer
* [ ] Admin Editor + Preview
* [ ] SEO scoring fonksiyonu ve görsel bileşen
* [ ] Zip exporter + dosya indirme
* [ ] Auth guard (basit)
* [ ] Tests + Lint
* [ ] README + örnek içerikler

---
