'use client';
import { useState, useEffect, useCallback } from 'react';
import NicknameModal from '@/components/NicknameModal';
import GameBoard from '@/components/GameBoard';
import Keyboard from '@/components/Keyboard';
import ResultModal from '@/components/ResultModal';
import StatsModal from '@/components/StatsModal';
import Leaderboard from '@/components/Leaderboard';
import HistoryPanel from '@/components/HistoryPanel';
import { useGame } from '@/hooks/useGame';
import { useStats } from '@/hooks/useStats';
import { useKeyboard } from '@/hooks/useKeyboard';

const LS_KEY = 'korean-wordle-nickname';

export default function Home() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'game' | 'board'>('game');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setNickname(saved);
  }, []);

  const handleNickname = (nick: string) => {
    localStorage.setItem(LS_KEY, nick);
    setNickname(nick);
  };

  const { gameState, displayRows, currentInput, keyStatuses, shake, loading, message, submitJamo, deleteJamo, submitGuess, startNewGame } = useGame(nickname);
  const { stats, refetch: refetchStats } = useStats(nickname);

  useEffect(() => {
    if (gameState && (gameState.status === 'won' || gameState.status === 'lost')) {
      const timer = setTimeout(() => {
        setShowResult(true);
        setHistoryKey(k => k + 1);
        refetchStats();
      }, gameState.status === 'won' ? 1500 : 500);
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
    }
  }, [gameState?.status, refetchStats]);

  const handleNext = useCallback(async () => {
    setShowResult(false);
    await startNewGame();
  }, [startNewGame]);

  const disabled = !gameState || gameState.status !== 'playing' || loading;

  useKeyboard({
    onJamo: submitJamo,
    onDelete: deleteJamo,
    onEnter: submitGuess,
    disabled,
  });

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-2xl font-black text-gray-900 tracking-tight">한글 워들</span>
          <div className="flex items-center gap-3">
            {nickname && (
              <>
                <span className="text-sm text-gray-500 hidden sm:block">
                  <span className="font-medium text-gray-800">{nickname}</span> 님
                </span>
                <button
                  onClick={() => setShowStats(true)}
                  className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span>📊</span>
                  <span className="hidden sm:inline">내 통계</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Toast */}
      {message && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg">
          {message}
        </div>
      )}

      {/* Mobile tab bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 flex">
        <button
          onClick={() => setActiveTab('game')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'game' ? 'text-gray-900 border-t-2 border-[#FAE100]' : 'text-gray-400'}`}
        >
          🎮 게임
        </button>
        <button
          onClick={() => setActiveTab('board')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'board' ? 'text-gray-900 border-t-2 border-[#FAE100]' : 'text-gray-400'}`}
        >
          🏆 리더보드
        </button>
      </div>

      {/* Mobile: 게임 탭 */}
      <main className={`lg:hidden flex-1 flex flex-col items-center gap-4 px-4 py-4 pb-24 ${activeTab === 'game' ? 'flex' : 'hidden'}`}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-400 text-lg">단어 불러오는 중...</div>
          </div>
        ) : gameState ? (
          <>
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#4CAF50] inline-block"></span>정확한 위치</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#FFC107] inline-block"></span>다른 위치</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#9E9E9E] inline-block"></span>없는 자모</span>
            </div>
            <GameBoard rows={displayRows} shake={shake} currentRow={gameState.currentRow} />
            <div className="flex-1 min-h-4" />
            <Keyboard keyStatuses={keyStatuses} onJamo={submitJamo} onDelete={deleteJamo} onEnter={submitGuess} disabled={disabled} />
            {nickname && <div className="w-full max-w-sm"><HistoryPanel nickname={nickname} refreshKey={historyKey} /></div>}
          </>
        ) : null}
      </main>

      {/* Mobile: 리더보드 탭 */}
      <main className={`lg:hidden flex-1 px-4 py-4 pb-24 overflow-y-auto ${activeTab === 'board' ? 'block' : 'hidden'}`}>
        <Leaderboard currentNickname={nickname || undefined} />
        {nickname && <div className="mt-4"><HistoryPanel nickname={nickname} refreshKey={historyKey} /></div>}
      </main>

      {/* Desktop */}
      <main className="hidden lg:flex flex-1 max-w-5xl mx-auto w-full px-4 py-4 gap-6">
        <div className="flex-1 flex flex-col items-center gap-4">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-400 text-lg">단어 불러오는 중...</div>
            </div>
          ) : gameState ? (
            <>
              <div className="flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#4CAF50] inline-block"></span>정확한 위치</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#FFC107] inline-block"></span>다른 위치</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#9E9E9E] inline-block"></span>없는 자모</span>
              </div>
              <GameBoard rows={displayRows} shake={shake} currentRow={gameState.currentRow} />
              <div className="flex-1 min-h-4" />
              <Keyboard keyStatuses={keyStatuses} onJamo={submitJamo} onDelete={deleteJamo} onEnter={submitGuess} disabled={disabled} />
            </>
          ) : null}
        </div>
        <aside className="flex flex-col gap-4 w-72 shrink-0">
          <Leaderboard currentNickname={nickname || undefined} />
          {nickname && <HistoryPanel nickname={nickname} refreshKey={historyKey} />}
        </aside>
      </main>

      {/* Modals */}
      {!nickname && <NicknameModal onSubmit={handleNickname} />}
      {showResult && gameState && (gameState.status === 'won' || gameState.status === 'lost') && (
        <ResultModal game={gameState} onNext={handleNext} />
      )}
      {showStats && (
        <StatsModal stats={stats} nickname={nickname || ''} onClose={() => setShowStats(false)} />
      )}
    </div>
  );
}
