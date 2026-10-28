# Kanban Lab

Üç ayrı Kanban uygulaması, tek public repo ve tek yayın çıktısı.

[Canlı koleksiyon](https://kanban-lab-hassanbera.snappybee2048.chatgpt.site) · [GitHub](https://github.com/hassanbera/kanban-lab)

| Proje  | Teknoloji                             | Canlı yol  |
| ------ | ------------------------------------- | ---------- |
| Mova   | HTML, CSS, JavaScript                 | `/mova/`   |
| Rota   | Next.js App Router, React, TypeScript | `/rota/`   |
| Katman | React, Vite, TypeScript               | `/katman/` |

Ana sayfa projeleri karşılaştırıp seçmek içindir. Uygulamaların altındaki ortak menü, ana sayfaya dönmeyi ve diğer projelere geçmeyi sağlar. Uygulamalar aynı domain altında tam sayfa olarak çalışır; iframe veya başka sitelere yönlendirme kullanılmaz.

## Yerelde çalıştırma

Node.js 22.12+ gereklidir.

```sh
npm ci
npm run build
npm run preview
```

Ana sayfa: http://127.0.0.1:4176/

`npm run dev` de birleşik statik önizlemeyi açar; önce build gerekir. Uygulama kaynaklarını değiştirince tekrar `npm run build` çalıştırın.

Tek uygulamayı geliştirmek için:

```sh
npm run dev --workspace=rota-next
# http://localhost:4174/rota/
npm run dev --workspace=katman-react
# http://localhost:4175/katman/
```

## Tek yayın

`npm run build`, üç uygulamayı `dist/` altında birleştirir:

```text
dist/
  index.html       # proje seçimi
  mova/            # vanilla uygulama
  rota/            # Next.js statik export
  katman/          # Vite üretim çıktısı
  previews/        # gerçek uygulama ekran görüntüleri
```

Statik hosting ayarı: build komutu `npm ci && npm run build`, yayın dizini `dist`. Tek domain yeterlidir. Dizin URL'lerinin sonuna `/` eklenmelidir; yerel sunucu bunu otomatik yönlendirir.

Domain kökü yerine `/kanban-lab/` gibi bir alt klasöre yayınlarken `LAB_BASE=/kanban-lab` ortam değişkenini build sırasında tanımlayın. Next.js basePath ve Vite base bu değere göre ayarlanır; giriş sayfası, proje menüsü ve PDF font adresleri göreli bağlantılar kullanır. Bu alt klasör build'ini hosting üzerinde `/kanban-lab/` altında sunun.

## Kaynak yapısı

```text
apps/mova/public/       # build gerektirmeyen kaynaklar
apps/rota/              # bağımsız Next.js kaynakları
apps/katman/            # bağımsız React + Vite kaynakları
packages/               # ortak proje menüsü stili
public/                 # koleksiyon giriş ekranı
scripts/build.mjs       # bütünleşik üretim derlemesi
scripts/serve.mjs       # yerel statik önizleme
```

Tek npm workspace kilidi kullanılır. Alt uygulamaların eski Site kimlikleri, Git geçmişleri, bağımlılık klasörleri ve derleme çıktıları taşınmamıştır. Ortak menü stili derleme başında uygulamaların public klasörlerine kopyalanır. Üretim çıktıları Git'e eklenmez. GitHub Actions üç uygulamayı temiz kurulumdan derler ve birleşik çıktıyı artifact olarak saklar.

## Veriler ve backend

Bu sürümler frontend uygulamalarıdır. Backend, hesap, ekip paylaşımı veya cihazlar arası senkronizasyon içermezler. Her uygulamanın farklı localStorage anahtarı vardır; proje geçişleri kayıtları birbirine karıştırmaz. Site verileri temizlenirse kayıtlar kaybolabilir. Eski ayrı domainlerdeki kayıtlar tarayıcı güvenlik sınırları nedeniyle bu yeni domaine otomatik taşınmaz; uygulama içindeki JSON yedekleme/geri yükleme araçları kullanılabilir.

Rota ve Katman'da sütun başına Türkçe PDF raporu, görünür renk seçimi, Radix modal/checkbox bileşenleri, dnd-kit taşıma, filtreler, kontrol listeleri ve koyu tema bulunur. Mova ilk vanilla sürümün davranışlarını korur. Uygulama içi ayrıntılar için ilgili uygulamanın README dosyasına bakın.

## Kontroller

`npm run build`, Mova JavaScript sözdizimini, Katman TypeScript kontrolünü, Next.js üretim derlemesini ve Vite üretim derlemesini çalıştırır. Proje geçişleri, alt yol asset yüklemeleri ve PDF font yolları gerçek tarayıcıda kontrol edilir.

PDF yazı tipi Noto Sans'tır; OFL lisansı ilgili `public/fonts/OFL.txt` dosyalarında bulunur. Diğer üçüncü taraf paketlerin kendi lisansları geçerlidir.
