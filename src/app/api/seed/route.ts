import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { get5JamoWords } from '@/lib/words';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
  const words = get5JamoWords();
  const rows = words.map(w => ({ word: w, difficulty: 1 }));

  const { data, error } = await supabase
    .from('words')
    .upsert(rows, { onConflict: 'word' })
    .select('word');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inserted: data?.length, words: data?.map(d => d.word) });
}

export async function GET() {
  // GET도 시드 실행 (브라우저에서 바로 접속 가능)
  const words = get5JamoWords();
  const rows = words.map(w => ({ word: w, difficulty: 1 }));

  const { data, error } = await supabase
    .from('words')
    .upsert(rows, { onConflict: 'word' })
    .select('word');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, inserted: data?.length, words: data?.map(d => d.word) });
}
