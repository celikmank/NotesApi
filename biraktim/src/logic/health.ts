/**
 * Sigara bırakma sağlık zaman çizelgesi.
 * Kaynak: yaygın halk sağlığı bilgisi. Tıbbi tavsiye değildir (bkz. Ayarlar).
 * Metinler tıbbi iddia dili yerine bilgilendirme dilinde tutulur.
 */
export interface HealthMilestone {
  afterSeconds: number;
  tr: string;
  en: string;
}

const MIN = 60;
const HOUR = 3_600;
const DAY = 86_400;

export const SMOKING_HEALTH_TIMELINE: HealthMilestone[] = [
  {
    afterSeconds: 20 * MIN,
    tr: '20 dakika: nabız ve tansiyon normale doğru gerilemeye başlar.',
    en: '20 minutes: heart rate and blood pressure begin to ease.',
  },
  {
    afterSeconds: 8 * HOUR,
    tr: '8 saat: kandaki karbonmonoksit düşer, oksijen seviyesi yükselir.',
    en: '8 hours: carbon monoxide drops and oxygen levels rise.',
  },
  {
    afterSeconds: 2 * DAY,
    tr: '48 saat: tat ve koku duyusu belirginleşmeye başlar.',
    en: '48 hours: taste and smell start to sharpen.',
  },
  {
    afterSeconds: 3 * DAY,
    tr: '72 saat: nefes almak kolaylaşır, enerji artar.',
    en: '72 hours: breathing feels easier and energy improves.',
  },
  {
    afterSeconds: 14 * DAY,
    tr: '2 hafta: dolaşım ve akciğer kapasitesi iyileşmeye devam eder.',
    en: '2 weeks: circulation and lung capacity keep improving.',
  },
  {
    afterSeconds: 30 * DAY,
    tr: '1 ay: öksürük ve nefes darlığı azalır.',
    en: '1 month: coughing and shortness of breath decrease.',
  },
  {
    afterSeconds: 90 * DAY,
    tr: '3 ay: akciğer fonksiyonu belirgin şekilde toparlanır.',
    en: '3 months: lung function noticeably recovers.',
  },
  {
    afterSeconds: 365 * DAY,
    tr: '1 yıl: kalp sağlığı riskleri anlamlı ölçüde geriler.',
    en: '1 year: heart-health risks fall significantly.',
  },
];

export interface HealthCardState {
  milestone: HealthMilestone;
  reached: boolean;
  progress: number; // 0..1 (bir sonrakine)
}

/** Zaman çizelgesini geçen süreye göre işaretler. */
export function healthCards(elapsedSeconds: number): HealthCardState[] {
  return SMOKING_HEALTH_TIMELINE.map((m) => ({
    milestone: m,
    reached: elapsedSeconds >= m.afterSeconds,
    progress: Math.min(1, elapsedSeconds / m.afterSeconds),
  }));
}
