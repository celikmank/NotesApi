# Evde Kurulum ve Telefonda Test

Bu dosya, projeyi evde bilgisayarında çalıştırıp telefonunda test etmen için
adım adım rehberdir. Teknik geçmişin olmasa da takip edebilirsin.

---

## 1. Önce bilgisayarına şunları kur (tek seferlik)

- **Node.js (LTS)** → https://nodejs.org  (yeşil "LTS" butonu). Kurulumu bitince
  terminalde `node -v` yazınca sürüm görmelisin (örn. v20 veya üzeri).
- **Telefonuna "Expo Go"** → App Store (iPhone) / Play Store (Android). Ücretsiz.

> İpucu: Kod düzenlemek istersen **VS Code** (https://code.visualstudio.com) iyi bir editör.

---

## 2. Projeyi aç

Sana gönderilen `biraktim-v1.0-scaffold.tar.gz` dosyasını bir klasöre çıkar.
Sonra terminalde (macOS: Terminal, Windows: PowerShell) o klasöre gir:

```bash
cd biraktim
npm install
```

`npm install` ilk seferde birkaç dakika sürer, internetten paketleri indirir. Normal.

---

## 3. En güncel SDK'ya çek (önerilir)

Kendi ağında Expo sunucularına erişimin olduğu için sürümleri en güncele almak
Expo Go ile uyumu garantiler:

```bash
npx expo install --fix
```

> Bu adımı atlarsan sorun olmaz ama telefonundaki Expo Go çok yeniyse "uyumsuz SDK"
> uyarısı görebilirsin. O uyarıyı görürsen bu komutu çalıştır ve tekrar dene.

---

## 4. Çalıştır ve telefonda aç

```bash
npx expo start
```

Terminalde bir **QR kod** belirir.

- **iPhone:** Kamera uygulamasıyla QR'ı okut → çıkan bağlantıya dokun (Expo Go açılır).
- **Android:** Expo Go uygulamasını aç → "Scan QR code" → QR'ı okut.

> Telefon ile bilgisayar **aynı Wi-Fi ağında** olmalı. Değilse:
> `npx expo start --tunnel` çalıştır (biraz daha yavaş ama farklı ağdan da bağlanır).

Uygulama telefonunda açılır. Kod her kaydettiğinde telefon otomatik yenilenir (hot reload).

---

## 5. Ne çalışır / ne çalışmaz (Expo Go'da)

**Çalışır:**
- Onboarding (3 adım), canlı sayaç, para/süre hesabı
- Milestone'lar, relapse akışı, SOS nefes ekranı
- Dil değişimi (TR/EN), tema, sağlık zaman çizelgesi
- Yerel veritabanı (SQLite) — verilerin telefonda kalıcı

**Çalışmaz (gerçek native gerektirir):**
- Gerçek satın alma (RevenueCat) → paywall açılır, "satın al" test modunda premium'u açar
- Gerçek push bildirimleri
- Bunlar için: `npx expo run:android` (Android Studio gerekir) veya **EAS Build** (bulutta APK üretir)

---

## 6. Takıldığın yerde

| Sorun | Çözüm |
|------|-------|
| `npm install` hata verdi | `npm install --legacy-peer-deps` dene |
| "Incompatible SDK" uyarısı | `npx expo install --fix` çalıştır, tekrar `npx expo start` |
| QR okutunca bağlanmıyor | Aynı Wi-Fi'de olduğundan emin ol, ya da `npx expo start --tunnel` |
| Kod doğru mu kontrol | `npm run typecheck` → "0 hata" beklenir |
| Metro takıldı | Terminalde `r` tuşuna bas (reload) ya da `npx expo start -c` (önbellek temizle) |

---

## 7. Sırada ne var (geliştirme fikirleri)

`README.md` içindeki "Durum" bölümüne bak. Öncelikli adaylar:
- Gerçek tarih seçici (onboarding 3. adım şu an "şimdi / dün")
- Milestone kutlama animasyonu + paylaşılabilir kart
- İstatistik ekranı (grafikler), hedef sistemi ("PS5 %62")
- Gerçek marka ikonu/splash (şu an `assets/` düz renk placeholder)

Bu adımlardan biri için yardım istersen, bu projeyi tekrar açıp devam edebiliriz.
