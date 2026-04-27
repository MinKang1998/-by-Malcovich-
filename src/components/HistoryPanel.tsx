'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { GameRecord } from '@/types';

interface Props {
  nickname: string;
  refreshKey?: number;
}

export default function HistoryPanel({ nickname, refreshKey }: Props) {
  const [records, setRecords] = useState<GameRecord[]>([]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    supabase
      .from('games')
      .select('id, word, attempts, status, duration, created_at, jamo_pattern')
      .eq('nickname', nickname)
      .gte('created_at', today.toISOString())
      .neq('status', 'playing')
      .order('created_at', { ascending: false })
      .then(({ data }) => setRecords((data as GameRecord[]) || []));
  }, [nickname, refreshKey]);

  if (records.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-bold text-gray-700 mb-2">오늘 내 기록</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {records.map(r => {
          const mins = Math.floor((r.duration || 0) / 60);
          const secs = (r.duration || 0) % 60;
          return (
            <div key={r.id} className="flex items-center gap-3 text-sm bg-gray-50 rounded-xl p-2">
              <span>{r.status === 'won' ? '✅' : '❌'}</span>
              <span className="font-medium text-gray-800">{r.word}</span>
              {r.status === 'won' && (
                <>
                  <span className="text-gray-500">{r.attempts}번</span>
                  <span className="text-gray-400 text-xs">
                    {mins > 0 ? `${mins}분` : ''}{secs}초
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
