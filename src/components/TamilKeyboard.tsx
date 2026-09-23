import { useState, useRef, useEffect, useCallback } from 'react';
import { Delete, X, Type } from 'lucide-react';

interface TamilKeyboardProps {
  onInsert: (text: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onClose: () => void;
  inputValue: string;
}

const vowels = ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ'];
const consonantsRow1 = ['க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம'];
const consonantsRow2 = ['ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன'];
const granthaRow = ['ஜ', 'ஶ', 'ஷ', 'ஸ', 'ஹ'];
const pulli = '்';

// Phonetic transliteration map (simplified)
const phoneticMap: Record<string, string> = {
  a: 'அ', aa: 'ஆ', i: 'இ', ii: 'ஈ', u: 'உ', uu: 'ஊ',
  e: 'எ', ee: 'ஏ', ai: 'ஐ', o: 'ஒ', oo: 'ஓ', au: 'ஔ',
  k: 'க', ng: 'ங', ch: 'ச', nj: 'ஞ',
  t: 'ட', nn: 'ண', th: 'த', n: 'ந',
  p: 'ப', m: 'ம', y: 'ய', r: 'ர', l: 'ல',
  v: 'வ', zh: 'ழ', ll: 'ள', rr: 'ற', nn2: 'ன',
  j: 'ஜ', sh: 'ஶ', sh2: 'ஷ', s: 'ஸ', h: 'ஹ',
};

// Common word suggestions for quick access
const commonWords = ['தமிழ்', 'அன்பு', 'வாழ்', 'உயிர்', 'மனம்', 'காதல்'];

function Key({
  char,
  onKey,
  wide,
  label,
}: {
  char: string;
  onKey: (c: string) => void;
  wide?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={() => onKey(char)}
      className={`font-tamil text-parchment-200/70 hover:text-bronze-300 hover:bg-bronze-400/[0.06] transition-all duration-300 border-b border-transparent hover:border-bronze-400/20 ${
        wide ? 'px-3' : 'px-2'
      } py-1.5 text-sm leading-none`}
      aria-label={label ?? char}
    >
      {label ?? char}
    </button>
  );
}

export default function TamilKeyboard({
  onInsert,
  onBackspace,
  onClear,
  onClose,
  inputValue,
}: TamilKeyboardProps) {
  const [mode, setMode] = useState<'character' | 'phonetic'>('character');
  const [phoneticBuf, setPhoneticBuf] = useState('');
  const phoneticRef = useRef<HTMLDivElement>(null);

  // Reset phonetic buffer when switching modes
  useEffect(() => {
    if (mode !== 'phonetic') setPhoneticBuf('');
  }, [mode]);

  const handlePhoneticChar = useCallback(
    (ch: string) => {
      const lower = ch.toLowerCase();
      if (lower === ' ') {
        onInsert(' ');
        setPhoneticBuf('');
        return;
      }
      const newBuf = phoneticBuf + lower;
      // Try progressively longer matches
      // Check 3-char, 2-char, 1-char
      const match3 = phoneticMap[newBuf.slice(-3)];
      const match2 = phoneticMap[newBuf.slice(-2)];
      const match1 = phoneticMap[newBuf.slice(-1)];

      if (match3) {
        // Replace last 3 chars with Tamil
        onInsert(match3);
        setPhoneticBuf('');
      } else if (match2) {
        // Could be start of a 3-char sequence — wait for one more char
        // But if the 2-char is a complete match and adding more won't help,
        // we should commit. Use a simple heuristic: if next char likely
        // doesn't extend, commit. For simplicity, commit 2-char matches.
        onInsert(match2);
        setPhoneticBuf('');
      } else if (match1) {
        onInsert(match1);
        setPhoneticBuf('');
      } else {
        // No match — keep buffer short
        if (newBuf.length > 3) {
          setPhoneticBuf(newBuf.slice(-1));
        } else {
          setPhoneticBuf(newBuf);
        }
      }
    },
    [phoneticBuf, onInsert],
  );

  // Listen for physical keyboard in phonetic mode
  useEffect(() => {
    if (mode !== 'phonetic') return;
    const handler = (e: KeyboardEvent) => {
      // Don't intercept if typing in the search input itself
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
        setPhoneticBuf('');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setPhoneticBuf('');
      } else if (/^[a-zA-Z ]$/.test(e.key)) {
        e.preventDefault();
        handlePhoneticChar(e.key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, handlePhoneticChar, onBackspace]);

  return (
    <div
      ref={phoneticRef}
      className="mt-4 border border-bronze-400/10 bg-ink-900/60 backdrop-blur-sm animate-fade-in"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-bronze-400/[0.08]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-bronze-400/50 tracking-[0.2em] uppercase">
            {mode === 'character' ? 'Tamil Keyboard' : 'Phonetic Input'}
          </span>
          {phoneticBuf && (
            <span className="text-[10px] font-mono text-parchment-300/30">buffer: {phoneticBuf}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Mode toggle */}
          <button
            onClick={() => setMode(mode === 'character' ? 'phonetic' : 'character')}
            className="flex items-center gap-1.5 text-[10px] font-mono text-parchment-300/40 hover:text-bronze-300 transition-colors duration-500"
          >
            <Type className="w-3 h-3" />
            {mode === 'character' ? 'Phonetic' : 'Characters'}
          </button>
          <button
            onClick={onClose}
            className="text-parchment-300/40 hover:text-bronze-300 transition-colors duration-500"
            aria-label="Close keyboard"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Current input preview */}
      <div className="px-4 py-2 border-b border-bronze-400/[0.06]">
        <span className="font-tamil text-base text-parchment-100">
          {inputValue || <span className="text-parchment-300/20 italic font-serif">—</span>}
        </span>
      </div>

      {mode === 'character' ? (
        <div className="px-4 py-3 space-y-2">
          {/* Vowels */}
          <div className="flex flex-wrap items-center gap-0.5">
            <span className="text-[9px] font-mono text-bronze-400/30 mr-2 w-14">vowels</span>
            {vowels.map((v) => (
              <Key key={v} char={v} onKey={onInsert} />
            ))}
          </div>

          {/* Consonants row 1 */}
          <div className="flex flex-wrap items-center gap-0.5">
            <span className="text-[9px] font-mono text-bronze-400/30 mr-2 w-14">consonants</span>
            {consonantsRow1.map((c) => (
              <Key key={c} char={c} onKey={onInsert} />
            ))}
          </div>

          {/* Consonants row 2 */}
          <div className="flex flex-wrap items-center gap-0.5">
            <span className="text-[9px] font-mono text-bronze-400/30 mr-2 w-14"></span>
            {consonantsRow2.map((c) => (
              <Key key={c} char={c} onKey={onInsert} />
            ))}
          </div>

          {/* Grantha + pulli */}
          <div className="flex flex-wrap items-center gap-0.5">
            <span className="text-[9px] font-mono text-bronze-400/30 mr-2 w-14">grantha</span>
            {granthaRow.map((c) => (
              <Key key={c} char={c} onKey={onInsert} />
            ))}
          </div>

          {/* Action row */}
          <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-bronze-400/[0.06]">
            <Key char={pulli} onKey={onInsert} label="் (pulli)" wide />
            <button
              onClick={() => onInsert(' ')}
              className="font-tamil text-parchment-200/50 hover:text-bronze-300 hover:bg-bronze-400/[0.06] transition-all duration-300 px-6 py-1.5 text-sm border-b border-transparent hover:border-bronze-400/20"
              aria-label="Space"
            >
              space
            </button>
            <button
              onClick={onBackspace}
              className="flex items-center gap-1 text-parchment-200/50 hover:text-bronze-300 hover:bg-bronze-400/[0.06] transition-all duration-300 px-3 py-1.5 text-xs border-b border-transparent hover:border-bronze-400/20 font-mono"
              aria-label="Backspace"
            >
              <Delete className="w-3 h-3" />
              backspace
            </button>
            <button
              onClick={onClear}
              className="text-parchment-200/50 hover:text-bronze-300 hover:bg-bronze-400/[0.06] transition-all duration-300 px-3 py-1.5 text-xs border-b border-transparent hover:border-bronze-400/20 font-mono"
              aria-label="Clear"
            >
              clear
            </button>
          </div>

          {/* Quick words */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-bronze-400/[0.06]">
            <span className="text-[9px] font-mono text-bronze-400/30 mr-1">quick</span>
            {commonWords.map((w) => (
              <button
                key={w}
                onClick={() => onInsert(w)}
                className="font-tamil text-sm text-parchment-300/50 hover:text-bronze-300 transition-colors duration-500"
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Phonetic mode */
        <div className="px-4 py-4 space-y-3">
          <p className="font-serif italic text-xs text-parchment-300/40 leading-relaxed">
            Type in English using phonetic spelling. For example: <span className="text-bronze-300/70">anbu</span> → அன்பு,
            <span className="text-bronze-300/70"> vaazh</span> → வாழ், <span className="text-bronze-300/70">tamil</span> → தமிழ்.
            Click letters below or type on your physical keyboard.
          </p>

          {/* Phonetic letter grid */}
          <div className="grid grid-cols-10 gap-0.5">
            {[
              ['a', 'அ'], ['aa', 'ஆ'], ['i', 'இ'], ['ii', 'ஈ'], ['u', 'உ'],
              ['uu', 'ஊ'], ['e', 'எ'], ['ee', 'ஏ'], ['ai', 'ஐ'], ['o', 'ஒ'],
              ['oo', 'ஓ'], ['au', 'ஔ'], ['k', 'க'], ['ng', 'ங'], ['ch', 'ச'],
              ['nj', 'ஞ'], ['t', 'ட'], ['nn', 'ண'], ['th', 'த'], ['n', 'ந'],
              ['p', 'ப'], ['m', 'ம'], ['y', 'ய'], ['r', 'ர'], ['l', 'ல'],
              ['v', 'வ'], ['zh', 'ழ'], ['ll', 'ள'], ['rr', 'ற'], ['s', 'ஸ'],
            ].map(([latin, tamil]) => (
              <button
                key={latin}
                onClick={() => onInsert(tamil)}
                className="flex flex-col items-center py-1.5 hover:bg-bronze-400/[0.06] transition-all duration-300 border-b border-transparent hover:border-bronze-400/15"
                title={`${latin} → ${tamil}`}
              >
                <span className="font-tamil text-sm text-parchment-200/70">{tamil}</span>
                <span className="font-mono text-[8px] text-bronze-400/30 mt-0.5">{latin}</span>
              </button>
            ))}
          </div>

          {/* Pulli + actions */}
          <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-bronze-400/[0.06]">
            <button
              onClick={() => onInsert(pulli)}
              className="font-tamil text-parchment-200/50 hover:text-bronze-300 hover:bg-bronze-400/[0.06] transition-all duration-300 px-3 py-1.5 text-sm border-b border-transparent hover:border-bronze-400/20"
            >
              ் <span className="font-mono text-[8px] text-bronze-400/30 ml-1">pulli</span>
            </button>
            <button
              onClick={() => onInsert(' ')}
              className="text-parchment-200/50 hover:text-bronze-300 hover:bg-bronze-400/[0.06] transition-all duration-300 px-6 py-1.5 text-xs border-b border-transparent hover:border-bronze-400/20 font-mono"
            >
              space
            </button>
            <button
              onClick={onBackspace}
              className="flex items-center gap-1 text-parchment-200/50 hover:text-bronze-300 hover:bg-bronze-400/[0.06] transition-all duration-300 px-3 py-1.5 text-xs border-b border-transparent hover:border-bronze-400/20 font-mono"
            >
              <Delete className="w-3 h-3" />
              backspace
            </button>
            <button
              onClick={onClear}
              className="text-parchment-200/50 hover:text-bronze-300 hover:bg-bronze-400/[0.06] transition-all duration-300 px-3 py-1.5 text-xs border-b border-transparent hover:border-bronze-400/20 font-mono"
            >
              clear
            </button>
          </div>

          {/* Quick words */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-bronze-400/[0.06]">
            <span className="text-[9px] font-mono text-bronze-400/30 mr-1">quick</span>
            {commonWords.map((w) => (
              <button
                key={w}
                onClick={() => onInsert(w)}
                className="font-tamil text-sm text-parchment-300/50 hover:text-bronze-300 transition-colors duration-500"
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
