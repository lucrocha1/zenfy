export interface MeditationSession {
  id: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  date: string; // YYYY-MM-DD format
}
