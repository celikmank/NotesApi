export type QuitType =
  | 'smoking'
  | 'alcohol'
  | 'sugar'
  | 'social_media'
  | 'gambling'
  | 'energy_drink'
  | 'fast_food'
  | 'gaming'
  | 'custom';

export type MilestoneKind = 'time' | 'money';

export interface Quit {
  id: number;
  type: QuitType;
  name: string;
  quit_date: string; // ISO
  daily_amount: number;
  unit_cost: number;
  currency: string;
  created_at: string;
  is_active: number; // 0 | 1
}

export type NewQuit = Omit<Quit, 'id' | 'created_at' | 'is_active'>;

export interface Milestone {
  id: number;
  quit_id: number;
  kind: MilestoneKind;
  threshold: number;
  achieved_at: string | null;
}

export interface Craving {
  id: number;
  quit_id: number;
  timestamp: string;
  resisted: number; // 0 | 1
  note: string | null;
}

export interface Streak {
  id: number;
  quit_id: number;
  start_date: string;
  end_date: string | null;
}
