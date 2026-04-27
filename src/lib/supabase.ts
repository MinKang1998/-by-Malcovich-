import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export type Database = {
  public: {
    Tables: {
      words: {
        Row: { id: number; word: string; difficulty: number };
        Insert: { word: string; difficulty?: number };
        Update: { word?: string; difficulty?: number };
      };
      games: {
        Row: {
          id: string;
          nickname: string;
          word: string;
          attempts: number | null;
          status: string;
          duration: number | null;
          created_at: string;
          guesses: string[] | null;
          jamo_pattern: string | null;
        };
        Insert: {
          id?: string;
          nickname: string;
          word: string;
          attempts?: number | null;
          status?: string;
          duration?: number | null;
          guesses?: string[] | null;
          jamo_pattern?: string | null;
        };
        Update: {
          attempts?: number | null;
          status?: string;
          duration?: number | null;
          guesses?: string[] | null;
          jamo_pattern?: string | null;
        };
      };
    };
  };
};
