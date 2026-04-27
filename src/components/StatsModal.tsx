'use client';
import type { UserStats } from '@/types';

interface Props {
  stats: UserStats | null;
  nickname: string;
  onClose: () => void;
}

export default function StatsModal({ stats, nickname, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">내 통계</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <p className="text-center text-gray-600 mb-6">
          <span className="font-bold text-gray-900">{nickname}</span> 님의 기록
        </p>

        {stats ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard label="총 플레이" value={stats.total_plays} />
            <StatCard label="승률" value={`${stats.win_rate}%`} />
            <StatCard label="평균 시도" value={stats.avg_attempts || '-'} />
            <StatCard label="현재 스트릭" value={stats.current_streak} suffix="연속" />
            <StatCard label="최고 스트릭" value={stats.max_streak} suffix="연속" />
            <StatCard label="총 승리" value={stats.wins} />
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">아직 플레이 기록이 없습니다.</p>
        )}

        <button
          onClick={onClose}
          className="w-full bg-[#FAE100] hover:bg-yellow-300 text-gray-900 font-bold py-3 rounded-xl transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-gray-900">
        {value}{suffix && <span className="text-sm ml-1 text-gray-600">{suffix}</span>}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
