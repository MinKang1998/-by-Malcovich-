// Korean Unicode range: 가 = 0xAC00, 힣 = 0xD7A3
// Syllable = 0xAC00 + (초성_idx * 21 + 중성_idx) * 28 + 종성_idx

const CHOSUNGS  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNGSUNGS = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONGSUNGS = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

export function decomposeChar(char: string): string[] {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return [char]; // already jamo or non-Korean
  const offset = code - 0xAC00;
  const jongIdx = offset % 28;
  const jungIdx = Math.floor(offset / 28) % 21;
  const choIdx  = Math.floor(offset / 28 / 21);
  const result  = [CHOSUNGS[choIdx], JUNGSUNGS[jungIdx]];
  if (jongIdx > 0) result.push(JONGSUNGS[jongIdx]);
  return result;
}

export function decomposeWord(word: string): string[] {
  return word.split('').flatMap(decomposeChar);
}

export function countJamos(word: string): number {
  return decomposeWord(word).length;
}

// Compute per-jamo tile statuses for a guess against an answer
export function computeTileStatuses(
  guessJamos: string[],
  answerJamos: string[]
): ('correct' | 'present' | 'absent')[] {
  const len = answerJamos.length;
  const result: ('correct' | 'present' | 'absent')[] = Array(len).fill('absent');
  const remaining: Record<string, number> = {};

  // First pass: exact matches + count remaining answer jamos
  for (let i = 0; i < len; i++) {
    if (guessJamos[i] === answerJamos[i]) {
      result[i] = 'correct';
    } else {
      remaining[answerJamos[i]] = (remaining[answerJamos[i]] || 0) + 1;
    }
  }

  // Second pass: present matches
  for (let i = 0; i < len; i++) {
    if (result[i] !== 'correct') {
      const j = guessJamos[i];
      if (remaining[j] > 0) {
        result[i] = 'present';
        remaining[j]--;
      }
    }
  }
  return result;
}

const VOWELS = new Set('ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split(''));
const CONSONANTS = new Set('ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split(''));

// 5자모가 한국어 음절 구조로 발음 가능한지 검사
// 유효 패턴:
//   CVC+CV → C V C C V  (예: 동부 = ㄷㅗㅇㅂㅜ)
//   CV+CVC → C V C V C  (예: 하늘 = ㅎㅏㄴㅡㄹ)
export function canFormValidSyllables(jamos: string[]): boolean {
  if (jamos.length !== 5) return false;
  const [j0, j1, j2, j3, j4] = jamos;
  const isC = (j: string) => CONSONANTS.has(j);
  const isV = (j: string) => VOWELS.has(j);

  const patternCVCCV = isC(j0) && isV(j1) && isC(j2) && isC(j3) && isV(j4); // CVC+CV
  const patternCVCVC = isC(j0) && isV(j1) && isC(j2) && isV(j3) && isC(j4); // CV+CVC

  return patternCVCCV || patternCVCVC;
}

// Korean jamo keyboard rows (standard QWERTY-mapped Korean layout)
export const KEYBOARD_ROWS: string[][] = [
  ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],
  ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
  ['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'],
];

// All jamos on keyboard for quick lookup
export const ALL_KEYBOARD_JAMOS = new Set(KEYBOARD_ROWS.flat());
