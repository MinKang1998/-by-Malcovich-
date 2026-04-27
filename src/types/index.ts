export type TileStatus = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

export interface Tile {
  jamo: string;
  status: TileStatus;
}

export interface GuessRow {
  tiles: Tile[];
  submitted: boolean;
}

export interface GameState {
  id: string;
  nickname: string;
  word: string;
  jamos: string[];
  guesses: GuessRow[];
  currentRow: number;
  status: 'playing' | 'won' | 'lost';
  startTime: number;
  duration?: number;
}

export interface GameRecord {
  id: string;
  nickname: string;
  word: string;
  attempts: number;
  status: 'won' | 'lost';
  duration: number;
  created_at: string;
  jamo_pattern?: string;
}

export interface LeaderboardEntry {
  nickname: string;
  wins: number;
  avg_attempts: number;
  avg_duration: number;
  total_games: number;
}

export interface UserStats {
  total_plays: number;
  wins: number;
  win_rate: number;
  avg_attempts: number;
  current_streak: number;
  max_streak: number;
}
