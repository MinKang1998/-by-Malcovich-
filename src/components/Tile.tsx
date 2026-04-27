'use client';
import type { TileStatus } from '@/types';

interface Props {
  jamo: string;
  status: TileStatus;
  reveal?: boolean;
  delay?: number;
}

const STATUS_STYLES: Record<TileStatus, string> = {
  correct: 'bg-[#4CAF50] border-[#4CAF50] text-white',
  present: 'bg-[#FFC107] border-[#FFC107] text-white',
  absent:  'bg-[#9E9E9E] border-[#9E9E9E] text-white',
  tbd:     'bg-white border-gray-400 text-gray-800',
  empty:   'bg-white border-gray-200 text-gray-800',
};

export default function Tile({ jamo, status, reveal = false, delay = 0 }: Props) {
  return (
    <div
      className={`
        flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14
        border-2 rounded-xl text-xl sm:text-2xl font-bold
        select-none transition-all duration-100
        ${STATUS_STYLES[status]}
        ${reveal && status !== 'empty' && status !== 'tbd' ? 'animate-flip' : ''}
        ${jamo && !reveal ? 'scale-105' : ''}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {jamo}
    </div>
  );
}
