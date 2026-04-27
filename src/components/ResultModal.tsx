'use client';
import { useState } from 'react';
import type { GameState } from '@/types';

interface Props {
  game: GameState;
  onNext: () => void;
}

function buildShareText(game: GameState): string {
  const rows = game.guesses.filter(r => r.submitted);
  const emoji = rows.map(row =>
    row.tiles.map(t =>
      t.status === 'correct' ? '🟩' : t.status === 'present' ? '🟨' : '⬜'
    ).join('')
  ).join('\n');

  const result = game.status === 'won'
    ? `${game.currentRow}/6`
    : 'X/6';

  return `한글 워들 ${result}\n\n${emoji}\n\n정답: ${game.word}`;
}

export default function ResultModal({ game, onNext }: Props) {
  const [copied, setCopied] = useState(false);
  const won = game.status === 'won';

  const handleCopy = () => {
    navigator.clipboard.writeText(buildShareText(game));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const minutes = Math.floor((game.duration || 0) / 60);
  const seconds = (game.duration || 0) % 60;
  const timeStr = minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{won ? '🎉' : '😢'}</div>
          <h2 className="text-2xl font-bold text-gray-900">
            {won ? '정답!' : '아쉽네요'}
          </h2>
          {won && (
            <p className="text-gray-600 mt-1">
              {game.currentRow}번 만에 맞췄습니다!
            </p>
          )}
          <p className="text-gray-600 mt-1">
            정답: <span className="font-bold text-gray-900">{game.word}</span>
          </p>
          <p className="text-gray-500 text-sm mt-1">클리어 시간: {timeStr}</p>
        </div>

        {/* Emoji pattern */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center font-mono text-lg leading-6 whitespace-pre">
          {game.guesses.filter(r => r.submitted).map((row, ri) => (
            <div key={ri}>
              {row.tiles.map((t, ti) => (
                <span key={ti}>
                  {t.status === 'correct' ? '🟩' : t.status === 'present' ? '🟨' : '⬜'}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl text-sm transition-colors"
          >
            {copied ? '✓ 복사됨' : '공유하기'}
          </button>
          <button
            onClick={onNext}
            className="flex-1 bg-[#FAE100] hover:bg-yellow-300 text-gray-900 font-bold py-3 rounded-xl text-sm transition-colors"
          >
            다음 단어 →
          </button>
        </div>
      </div>
    </div>
  );
}
