'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { decomposeWord, computeTileStatuses, canFormValidSyllables } from '@/lib/korean';
import type { GameState, GuessRow, Tile } from '@/types';

const JAMO_COUNT = 5;
const MAX_GUESSES = 6;

function buildEmptyRow(): GuessRow {
  return {
    tiles: Array.from({ length: JAMO_COUNT }, () => ({ jamo: '', status: 'empty' as const })),
    submitted: false,
  };
}

// Restore submitted rows from saved jamo strings
function buildRowsFromSaved(savedGuesses: string[], answerJamos: string[]): GuessRow[] {
  const rows: GuessRow[] = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < savedGuesses.length) {
      // Each saved guess is a string of raw jamos joined (e.g. 'ㄱㅏㅇㅏㅁ')
      const guessJamos = savedGuesses[i].split('');
      const padded = [...guessJamos, ...Array(JAMO_COUNT).fill('')].slice(0, JAMO_COUNT);
      const statuses = computeTileStatuses(padded, answerJamos);
      rows.push({
        tiles: padded.map((j, idx) => ({ jamo: j, status: statuses[idx] })) as Tile[],
        submitted: true,
      });
    } else {
      rows.push(buildEmptyRow());
    }
  }
  return rows;
}

export function useGame(nickname: string | null) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentInput, setCurrentInput] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const startTimeRef = useRef<number>(Date.now());

  const showMessage = useCallback((msg: string, duration = 2000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  }, []);

  const loadOrCreateGame = useCallback(async (nick: string) => {
    setLoading(true);
    setCurrentInput([]);
    try {
      // 1. Check for in-progress game
      const { data: existing } = await supabase
        .from('games')
        .select('*')
        .eq('nickname', nick)
        .eq('status', 'playing')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        const answerJamos = decomposeWord(existing.word);
        const savedGuesses: string[] = existing.guesses || [];
        const rows = buildRowsFromSaved(savedGuesses, answerJamos);
        startTimeRef.current = Date.now();
        setGameState({
          id: existing.id,
          nickname: nick,
          word: existing.word,
          jamos: answerJamos,
          guesses: rows,
          currentRow: savedGuesses.length,
          status: 'playing',
          startTime: Date.now(),
        });
        setLoading(false);
        return;
      }

      // 2. Get recently played words (last 20) to avoid repeats
      const { data: recent } = await supabase
        .from('games')
        .select('word')
        .eq('nickname', nick)
        .order('created_at', { ascending: false })
        .limit(20);

      const recentWords = new Set((recent || []).map((r: { word: string }) => r.word));

      // 3. Pick a random word from DB
      const { data: wordsData } = await supabase
        .from('words')
        .select('word');

      if (!wordsData || wordsData.length === 0) {
        showMessage('단어 데이터가 없습니다. /api/seed를 먼저 실행해주세요.');
        setLoading(false);
        return;
      }

      const available = wordsData.filter((w: { word: string }) => !recentWords.has(w.word));
      const pool = available.length > 0 ? available : wordsData;
      const chosen = pool[Math.floor(Math.random() * pool.length)].word;
      const answerJamos = decomposeWord(chosen);

      // 4. Create new game record
      const { data: newGame } = await supabase
        .from('games')
        .insert({ nickname: nick, word: chosen, status: 'playing', guesses: [] })
        .select('id')
        .single();

      if (!newGame) {
        showMessage('게임을 시작할 수 없습니다.');
        setLoading(false);
        return;
      }

      startTimeRef.current = Date.now();
      setGameState({
        id: newGame.id,
        nickname: nick,
        word: chosen,
        jamos: answerJamos,
        guesses: Array.from({ length: MAX_GUESSES }, buildEmptyRow),
        currentRow: 0,
        status: 'playing',
        startTime: Date.now(),
      });
    } catch (err) {
      console.error(err);
      showMessage('오류가 발생했습니다.');
    }
    setLoading(false);
  }, [showMessage]);

  useEffect(() => {
    if (nickname) loadOrCreateGame(nickname);
  }, [nickname, loadOrCreateGame]);

  const submitJamo = useCallback((jamo: string) => {
    if (!gameState || gameState.status !== 'playing') return;
    if (currentInput.length >= JAMO_COUNT) return;
    setCurrentInput(prev => [...prev, jamo]);
  }, [gameState, currentInput.length]);

  const deleteJamo = useCallback(() => {
    setCurrentInput(prev => prev.slice(0, -1));
  }, []);

  const submitGuess = useCallback(async () => {
    if (!gameState || gameState.status !== 'playing') return;
    if (currentInput.length !== JAMO_COUNT) {
      setShake(true);
      showMessage('자모를 5개 입력해주세요');
      setTimeout(() => setShake(false), 600);
      return;
    }

    if (!canFormValidSyllables(currentInput)) {
      setShake(true);
      showMessage('없는 단어입니다');
      setTimeout(() => setShake(false), 600);
      return;
    }

    const guessJamos = currentInput;
    const statuses = computeTileStatuses(guessJamos, gameState.jamos);
    const newRows = gameState.guesses.map((row, idx) => {
      if (idx === gameState.currentRow) {
        return {
          tiles: guessJamos.map((j, i) => ({ jamo: j, status: statuses[i] })) as Tile[],
          submitted: true,
        };
      }
      return row;
    });

    const newRow = gameState.currentRow + 1;
    const won = statuses.every(s => s === 'correct');
    const lost = !won && newRow >= MAX_GUESSES;
    const newStatus = won ? 'won' : lost ? 'lost' : 'playing';
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Persist to DB
    const previousGuesses = gameState.guesses
      .filter(r => r.submitted)
      .map(r => r.tiles.map(t => t.jamo).join(''));
    const allGuesses = [...previousGuesses, guessJamos.join('')];

    const pattern = statuses.map(s =>
      s === 'correct' ? '🟩' : s === 'present' ? '🟨' : '⬜'
    ).join('');

    await supabase.from('games').update({
      guesses: allGuesses,
      attempts: newRow,
      status: newStatus,
      ...(newStatus !== 'playing' ? { duration, jamo_pattern: pattern } : {}),
    }).eq('id', gameState.id);

    setGameState(prev => prev ? {
      ...prev,
      guesses: newRows,
      currentRow: newRow,
      status: newStatus,
      duration,
    } : null);
    setCurrentInput([]);

    if (won) showMessage('정답! 🎉', 2500);
    else if (lost) showMessage(`정답: ${gameState.word}`, 5000);
  }, [gameState, currentInput, showMessage]);

  const startNewGame = useCallback(async () => {
    if (!nickname) return;
    await loadOrCreateGame(nickname);
  }, [nickname, loadOrCreateGame]);

  // Merge currentInput into the current row for display
  const displayRows = gameState ? gameState.guesses.map((row, idx) => {
    if (idx === gameState.currentRow && gameState.status === 'playing') {
      return {
        ...row,
        tiles: Array.from({ length: JAMO_COUNT }, (_, i) => ({
          jamo: currentInput[i] ?? '',
          status: (currentInput[i] ? 'tbd' : 'empty') as 'tbd' | 'empty',
        })),
      };
    }
    return row;
  }) : [];

  // Build keyboard color map from submitted guesses
  const keyStatuses: Record<string, 'correct' | 'present' | 'absent'> = {};
  if (gameState) {
    for (const row of gameState.guesses.filter(r => r.submitted)) {
      for (const tile of row.tiles) {
        if (!tile.jamo) continue;
        const curr = keyStatuses[tile.jamo];
        if (tile.status === 'correct') keyStatuses[tile.jamo] = 'correct';
        else if (tile.status === 'present' && curr !== 'correct') keyStatuses[tile.jamo] = 'present';
        else if (tile.status === 'absent' && !curr) keyStatuses[tile.jamo] = 'absent';
      }
    }
  }

  return {
    gameState,
    displayRows,
    currentInput,
    keyStatuses,
    shake,
    loading,
    message,
    submitJamo,
    deleteJamo,
    submitGuess,
    startNewGame,
  };
}
