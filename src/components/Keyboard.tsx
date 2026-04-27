'use client';
import { KEYBOARD_ROWS } from '@/lib/korean';

interface Props {
  keyStatuses: Record<string, 'correct' | 'present' | 'absent' | 'unused'>;
  onJamo: (j: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  disabled?: boolean;
}

const KEY_COLORS: Record<string, string> = {
  correct: 'bg-[#4CAF50] text-white border-[#4CAF50]',
  present: 'bg-[#FFC107] text-white border-[#FFC107]',
  absent:  'bg-[#9E9E9E] text-white border-[#9E9E9E]',
  unused:  'bg-white text-gray-800 border-gray-300 hover:bg-gray-100',
};

export default function Keyboard({ keyStatuses, onJamo, onDelete, onEnter, disabled }: Props) {
  return (
    <div className="flex flex-col gap-1.5 items-center select-none">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1 sm:gap-1.5">
          {ri === 2 && (
            <button
              onClick={onEnter}
              disabled={disabled}
              className="px-2 sm:px-3 h-12 sm:h-14 rounded-lg border-2 border-[#FAE100] bg-[#FAE100] text-gray-900 font-bold text-xs sm:text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50"
            >
              확인
            </button>
          )}
          {row.map(jamo => {
            const status = keyStatuses[jamo] || 'unused';
            return (
              <button
                key={jamo}
                onClick={() => !disabled && onJamo(jamo)}
                disabled={disabled}
                className={`w-9 h-12 sm:w-11 sm:h-14 rounded-lg border-2 font-bold text-base sm:text-lg transition-colors disabled:opacity-50 ${KEY_COLORS[status]}`}
              >
                {jamo}
              </button>
            );
          })}
          {ri === 2 && (
            <button
              onClick={onDelete}
              disabled={disabled}
              className="px-2 sm:px-3 h-12 sm:h-14 rounded-lg border-2 border-gray-300 bg-white text-gray-800 font-bold text-xs sm:text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
