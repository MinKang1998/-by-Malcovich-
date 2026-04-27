'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserStats } from '@/types';

export function useStats(nickname: string | null) {
  const [stats, setStats] = useState<UserStats | null>(null);

  const fetchStats = useCallback(async () => {
    if (!nickname) return;
    const { data } = await supabase
      .from('games')
      .select('status, attempts, created_at')
      .eq('nickname', nickname)
      .neq('status', 'playing')
      .order('created_at', { ascending: true });

    if (!data) return;

    const total = data.length;
    const wins = data.filter(g => g.status === 'won').length;
    const winAttempts = data.filter(g => g.status === 'won' && g.attempts).map(g => g.attempts!);
    const avgAttempts = winAttempts.length ? winAttempts.reduce((a, b) => a + b, 0) / winAttempts.length : 0;

    let streak = 0, maxStreak = 0, curr = 0;
    for (const g of data) {
      if (g.status === 'won') {
        curr++;
        maxStreak = Math.max(maxStreak, curr);
      } else {
        curr = 0;
      }
    }
    streak = curr;

    setStats({
      total_plays: total,
      wins,
      win_rate: total ? Math.round((wins / total) * 100) : 0,
      avg_attempts: Math.round(avgAttempts * 10) / 10,
      current_streak: streak,
      max_streak: maxStreak,
    });
  }, [nickname]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, refetch: fetchStats };
}
