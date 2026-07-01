# Bıraktım — Bırakma Sayacı

Kötü alışkanlıkları bırakmayı takip eden local-first sayaç uygulaması (sigara, alkol, şeker,
sosyal medya, kumar, …). Süre + biriken para + milestone takibi. Hesap yok, sunucu yok, tüm veri
cihazda (SQLite). Pazarlama açısı sigara bırakma odaklı (ASO), codebase genel.

> **Not:** Bu, MVP mimarisini kuran çalışan bir iskelettir — v1.0 kapsamının çekirdeği hazır,
> üstüne özellik eklenerek büyütülecek şekilde tasarlandı. Aşağıda "Durum" bölümünde ne bitti /
> ne kaldı listelenmiştir.

## Stack

- **React Native + Expo (SDK 52)** — TypeScript strict, expo-router (file-based)
- **expo-sqlite** — local-first veri
- **RevenueCat** (`react-native-purchases`) — abonelik
- **expo-notifications** — milestone + motivasyon bildirimleri
- **i18n-js + expo-localization** — TR / EN
- Tasarım: Mixtape warm dark palette; Bricolage Grotesque / Space Grotesk / Space Mono

## Kurulum

```bash
npm install
cp .env.example .env      # RevenueCat anahtarlarını isteğe bağlı gir
npx expo install --fix    # SDK ile uyumlu sürümleri sabitle
npm start                 # Expo Dev Server (Expo Go veya dev build)
```

> RevenueCat anahtarı girilmezse uygulama tam çalışır; paywall geliştirme modunda premium'u açar.

Faydalı komutlar:

```bash
npm run typecheck   # tsc --noEmit
npm run android     # Android cihaz/emülatör
npm run ios         # iOS simülatör
```

## Proje yapısı

```
app/                       expo-router ekranları
  _layout.tsx              kök: fontlar, DB init, providerlar
  index.tsx                onboarding tamamlandı mı → yönlendirme
  onboarding/step1..3.tsx  3 adımlı onboarding
  (main)/                  tab navigasyon
    index.tsx              ana sayaç (canlı süre + para + milestone ring + sağlık)
    milestones.tsx         milestone listesi (free 3 / premium tümü)
    settings.tsx           dil, bildirim, restore, tıbbi uyarı
  paywall.tsx              soft paywall (modal)
  relapse.tsx              yargılamayan relapse akışı (modal)
  sos.tsx                  kriz anı: 4-7-8 nefes + motivasyon + dikkat dağıtma (modal)
src/
  db/                      SQLite şema, migrations, repository fonksiyonları
  logic/                   para/süre hesabı, milestone tanımları, sağlık zaman çizelgesi
  theme/                   renk, tipografi, spacing (Mixtape)
  i18n/                    tr / en sözlükleri
  components/              Text, Button, Card, Screen, ProgressRing
  hooks/                   useNow (canlı tik), useActiveQuit
  services/                notifications, purchases (RevenueCat)
  state/                   PremiumContext, onboarding taslağı
assets/                    placeholder ikon/splash (yayın öncesi değiştir)
```

## Veri modeli (SQLite)

`quits`, `milestones`, `cravings`, `streaks`, `settings` — bkz. `src/db/schema.ts`.
Şema sürümü `PRAGMA user_version` ile yönetilir; yeni sürümler `src/db/index.ts` içindeki
`MIGRATIONS` dizisine eklenir.

## Durum (v1.0)

**Hazır:** onboarding (3 adım), ana canlı sayaç, para hesabı, milestone'lar (süre + para,
free/premium kapısı), relapse akışı (geçmiş seri saklama), bildirim iskeleti, soft paywall,
SOS ekranı (4-7-8), TR/EN, tema sistemi, sağlık zaman çizelgesi (sigara).

**Sonraki adımlar:** gerçek `DateTimePicker` (step3 şu an şimdi/dün), milestone kutlama
animasyonu + paylaşım kartı, detaylı istatistik grafikleri, hedef sistemi ("PS5 %62"),
widget, dosya export/yedekleme, RevenueCat offering'lerinin bağlanması, gerçek marka assetleri.

## Yasal

Tıbbi iddia yok; sağlık bilgileri yaygın halk sağlığı bilgisidir, "tıbbi tavsiye değildir"
ibaresi Ayarlar'da. Veri cihazda → KVKK/GDPR yükü minimal.

---

## Bu iskeleti kendi ayrı repona taşıma

Bu klasör bağımsız bir projedir. Kendi `biraktim` GitHub reponu oluşturup şöyle taşı:

```bash
# 1) GitHub'da boş bir repo aç (README ekleme): github.com/new  →  biraktim

# 2) Bu klasörü tek başına bir repoya çevir
cd biraktim
git init
git add .
git commit -m "Bıraktım v1.0 iskelet"
git branch -M main
git remote add origin git@github.com:<kullanıcı-adın>/biraktim.git
git push -u origin main
```

Alternatif: `git subtree split` ile mevcut repodan geçmişiyle birlikte çıkarabilirsin.
