'use client';
import { useEffect } from 'react';

const KEY_MAP: Record<string, string> = {
  q:'ㅂ', w:'ㅈ', e:'ㄷ', r:'ㄱ', t:'ㅅ',
  y:'ㅛ', u:'ㅕ', i:'ㅑ', o:'ㅐ', p:'ㅔ',
  a:'ㅁ', s:'ㄴ', d:'ㅇ', f:'ㄹ', g:'ㅎ',
  h:'ㅗ', j:'ㅓ', k:'ㅏ', l:'ㅣ',
  z:'ㅋ', x:'ㅌ', c:'ㅊ', v:'ㅍ', b:'ㅠ', n:'ㅜ', m:'ㅡ',
};

interface Options {
  onJamo: (j: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  disabled?: boolean;
}

export function useKeyboard({ onJamo, onDelete, onEnter, disabled }: Options) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();

      if (e.key === 'Enter') { e.preventDefault(); onEnter(); return; }
      if (e.key === 'Backspace') { e.preventDefault(); onDelete(); return; }

      const jamo = KEY_MAP[key];
      if (jamo) { e.preventDefault(); onJamo(jamo); }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onJamo, onDelete, onEnter, disabled]);
}
