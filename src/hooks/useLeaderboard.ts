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

    const channelName = `games-changes-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes' as any, {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
      }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { entries, loading, refetch: fetchLeaderboard };
}
