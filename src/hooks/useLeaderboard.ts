'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { LeaderboardEntry } from '@/types';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(20);
    setEntries((data as LeaderboardEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel('games-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `status=neq.playing`,
      }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { entries, loading, refetch: fetchLeaderboard };
}
