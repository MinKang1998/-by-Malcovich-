'use client';
import { useLeaderboard } from '@/hooks/useLeaderboard';

interface Props {
  currentNickname?: string;
}

export default function Leaderboard({ currentNickname }: Props) {
  const { entries, loading } = useLeaderboard();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏆</span>
        <h3 className="font-bold text-gray-900 text-sm">오늘의 리더보드</h3>
        <span className="text-xs text-gray-400 ml-auto">실시간</span>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 text-sm py-6">불러오는 중...</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-6">
          아직 오늘 완료된 게임이 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, idx) => (
            <div
              key={entry.nickname}
              className={`flex items-center gap-2 p-2 rounded-xl text-sm ${
                entry.nickname === currentNickname ? 'bg-yellow-50 border border-[#FAE100]' : 'hover:bg-gray-50'
              }`}
            >
              <span className={`w-6 text-center font-bold ${
                idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-gray-400'
              }`}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
              </span>
              <span className={`flex-1 font-medium truncate ${entry.nickname === currentNickname ? 'text-gray-900' : 'text-gray-700'}`}>
                {entry.nickname}
                {entry.nickname === currentNickname && <span className="text-xs text-gray-400 ml-1">(나)</span>}
              </span>
              <div className="flex gap-2 text-right text-xs text-gray-500 shrink-0">
                <span className="text-[#4CAF50] font-bold">{entry.wins}승</span>
                <span>{entry.avg_attempts}회</span>
                <span>{entry.avg_duration}s</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
        <span>승리수 → 평균시도 → 클리어시간</span>
      </div>
    </div>
  );
}
