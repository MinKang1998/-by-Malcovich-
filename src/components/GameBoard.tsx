'use client';
import Tile from './Tile';
import type { GuessRow } from '@/types';

interface Props {
  rows: GuessRow[];
  shake: boolean;
  currentRow: number;
}

export default function GameBoard({ rows, shake, currentRow }: Props) {
  return (
    <div className="flex flex-col gap-2 items-center">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className={`flex gap-2 ${shake && rowIdx === currentRow ? 'animate-shake' : ''}`}
        >
          {row.tiles.map((tile, tileIdx) => (
            <Tile
              key={tileIdx}
              jamo={tile.jamo}
              status={tile.status}
              reveal={row.submitted}
              delay={row.submitted ? tileIdx * 100 : 0}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
