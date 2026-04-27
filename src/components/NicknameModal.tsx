'use client';
import { useState } from 'react';

interface Props {
  onSubmit: (nickname: string) => void;
}

export default function NicknameModal({ onSubmit }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) { setError('닉네임을 입력해주세요.'); return; }
    if (trimmed.length < 2 || trimmed.length > 12) { setError('2~12자로 입력해주세요.'); return; }
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🇰🇷</div>
          <h1 className="text-2xl font-bold text-gray-900">한글 워들</h1>
          <p className="text-gray-500 text-sm mt-1">5자모 한국어 단어 맞추기</p>
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
          <input
            type="text"
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="닉네임 입력 (2~12자)"
            maxLength={12}
            autoFocus
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#FAE100] transition-colors text-center text-lg font-medium"
          />
          {error && <p className="text-red-500 text-sm mt-1 text-center">{error}</p>}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#FAE100] hover:bg-yellow-300 text-gray-900 font-bold py-3 rounded-xl text-lg transition-colors mt-4"
        >
          게임 시작
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          닉네임은 브라우저에 저장되어 재방문 시 유지됩니다
        </p>
      </div>
    </div>
  );
}
