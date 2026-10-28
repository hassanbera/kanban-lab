# Katman

React + Vite + TypeScript ile genel amaçlı kişisel Kanban uygulaması.

## Çalıştırma

Bu uygulama Kanban Lab workspace içindedir. Ana kurulum ve birleşik yayın için [kök README](../../README.md) dosyasına bakın.

Node.js 22.12 veya üzeri önerilir.

```sh
npm ci
npm run dev
```

Yerel adres: http://127.0.0.1:4175/katman/

```sh
npm run typecheck
npm run build
```

Üretim çıktısı `dist/` klasöründedir; statik sunucuda yayınlanabilir.

## Backend durumu

Bu sürüm **frontend uygulamasıdır**. Sunucu API'si, veritabanı, hesap, ekip daveti ve cihazlar arası senkronizasyon yoktur. Panolar bu site adresindeki tarayıcı localStorage kaydında saklanır. Site verileri silinirse kayıtlar kaybolur. Ayarlar ve yardım bölümünden JSON yedeği alınabilir ve Rota/Katman yedekleri geri yüklenebilir.

Vite geliştirme sunucusu uygulama backend’i değildir. Üretim çıktısı HTML, CSS, JavaScript ve font dosyalarından oluşur.

## Özellikler

- Birden fazla pano, pano adı/açıklaması/rengi ve onaylı silme.
- Görev ekleme/düzenleme/silme; açıklama, tarih, etiket, öncelik ve atama.
- Görünür renk örnekleriyle kart kapağı ve sütun rengi seçimi.
- Sütun başlığını düzenleme.
- Pointer ve klavye sensörleriyle sürükle bırak; tutamaçta boşluk, ok tuşları ve tekrar boşluk ile taşıma.
- Kart üzerinde ve detay penceresinde okunaklı kontrol listeleri.
- Arama, öncelik/etiket filtreleri, bana atananlar, liste/pano görünümü.
- Sütun başlığı veya üst araç çubuğundan **sütun PDF indirme**. PDF seçilen sütundaki tüm görevleri içerir; arama/filtre raporu daraltmaz. Açıklama, öncelik, tarih, etiket ve kontrol listeleri dahil edilir. Uzun içerik sayfalara bölünür.
- Açık/koyu tema, mobil yan menü, sabit modal başlığı ve alt aksiyon çubuğu, uygulamayla uyumlu scrollbar.
- JSON yedekleme/geri yükleme ayrı olarak Ayarlar ve yardım içindedir.

## Bileşenler

- `src/components/kanban-app.tsx`: React arayüzü ve uygulama durum geçişleri.
- `src/components/model.ts`: TypeScript veri modeli, örnek veriler ve yedek doğrulaması.
- `src/components/ui.tsx`: Radix Dialog ve Checkbox temelli erişilebilir UI bileşenleri. Tam shadcn kurulumu değildir.
- `src/components/column-pdf.ts`: istemci tarafında jsPDF ile sütun raporu.
- `public/fonts/`: OFL lisanslı Noto Sans, Türkçe PDF metinleri için gömülür. Kaynak fontlar @fontsource/noto-sans paketinden alınmış ve latin/latin-ext alt kümeleri birleştirilmiştir.

Rota ve Katman'ın temel veri modeli ve davranışları ortaktır; her proje kendi dosyaları, paket kilidi, site adresi ve tarayıcı kayıt anahtarıyla bağımsızdır. Mevcut hukuk uygulamasından müşteri verisi veya API bağlantısı alınmamıştır.

## Doğrulama

Her iki uygulama üretim derlemesinden ve TypeScript kontrolünden geçirilmiştir. Ortak bileşenlerde pano oluşturma/silme, görev kaydı, yenileme sonrası kalıcılık, öncelik filtresi, liste görünümü, kontrol listesi, renk/sütun başlığı değişimi ve klavyeyle sütunlar arası taşıma gerçek tarayıcıda kontrol edilmiştir. PDF çıktısında Türkçe karakterler, yalnızca seçilen sütunun içeriği ve iki sayfalık uzun açıklama doğrulanmış; PDF sayfaları görsel olarak incelenmiştir. Mobil detay penceresi ve koyu tema da kontrol edilmiştir.
