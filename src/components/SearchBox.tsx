import { useState, useRef, useCallback } from 'react';
import { Search, AlertCircle, Keyboard } from 'lucide-react';
import { getWord, BackendUnavailableError } from '@/api';
import TamilKeyboard from './TamilKeyboard';

const suggestions = ['அன்பு', 'தமிழ்', 'வாழ்', 'உயிர்', 'மனம்'];

interface SearchBoxProps {
  variant?: 'hero' | 'minimal';
  onResult?: (data: unknown) => void;
  onSearch?: (word: string) => void;
}

export default function SearchBox({ variant = 'hero', onResult, onSearch }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPos = useRef(0);

  const insertAtCursor = useCallback((text: string) => {
    setQuery((prev) => {
      const pos = cursorPos.current;
      const next = prev.slice(0, pos) + text + prev.slice(pos);
      cursorPos.current = pos + text.length;
      // Restore cursor after React updates
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(cursorPos.current, cursorPos.current);
        }
      });
      return next;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setQuery((prev) => {
      const pos = cursorPos.current;
      if (pos <= 0) return prev;
      const next = prev.slice(0, pos - 1) + prev.slice(pos);
      cursorPos.current = pos - 1;
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(cursorPos.current, cursorPos.current);
        }
      });
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    cursorPos.current = 0;
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const syncCursor = () => {
    if (inputRef.current) {
      cursorPos.current = inputRef.current.selectionStart ?? query.length;
    }
  };

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const word = query.trim();
    if (!word) return;

    setLoading(true);
    setError(null);

    if (onSearch) {
      onSearch(word);
      setLoading(false);
      return;
    }

    try {
      const data = await getWord(word);
      onResult?.(data);
    } catch (err) {
      if (err instanceof BackendUnavailableError) {
        setError('Backend unavailable — the Tamil semantic API could not be reached.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  const keyboardToggle = (
    <button
      onClick={() => {
        setKeyboardOpen(!keyboardOpen);
        if (!keyboardOpen) {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }}
      className={`flex items-center gap-1.5 text-[11px] font-tamil transition-colors duration-500 whitespace-nowrap ${
        keyboardOpen
          ? 'text-bronze-300'
          : 'text-parchment-300/35 hover:text-bronze-300/70'
      }`}
      aria-label="Toggle Tamil keyboard"
      aria-expanded={keyboardOpen}
    >
      <Keyboard className="w-3.5 h-3.5" />
      தமிழ்
    </button>
  );

  if (variant === 'minimal') {
    return (
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSearch} className="w-full">
          <div className="flex items-center gap-3 border-b border-bronze-400/25 pb-2 focus-within:border-bronze-400/60 transition-colors duration-700">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                syncCursor();
              }}
              onClick={syncCursor}
              onKeyUp={syncCursor}
              onFocus={syncCursor}
              placeholder="Search Tamil word…"
              className="flex-1 bg-transparent border-0 outline-none font-tamil text-base text-parchment-100 placeholder:text-parchment-300/30 min-w-0"
              aria-label="Search a Tamil word"
            />
            {keyboardToggle}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="text-bronze-300/80 hover:text-bronze-300 transition-colors duration-500 disabled:opacity-30 shrink-0"
              aria-label="Search"
            >
              {loading ? '…' : <Search className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {keyboardOpen && (
          <TamilKeyboard
            onInsert={insertAtCursor}
            onBackspace={handleBackspace}
            onClear={handleClear}
            onClose={() => setKeyboardOpen(false)}
            inputValue={query}
          />
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 text-bronze-400/70 text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSearch} className="w-full">
        <div className="flex items-center gap-3 border-b border-parchment-300/20 pb-3 focus-within:border-bronze-400/50 transition-colors duration-700">
          <Search className="w-4 h-4 text-parchment-300/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              syncCursor();
            }}
            onClick={syncCursor}
            onKeyUp={syncCursor}
            onFocus={syncCursor}
            placeholder="Search a Tamil word — e.g. அன்பு, தமிழ், வாழ்…"
            className="flex-1 bg-transparent border-0 outline-none font-tamil text-base text-parchment-100 placeholder:text-parchment-300/30 min-w-0"
            aria-label="Search a Tamil word"
          />
          {keyboardToggle}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="text-[13px] tracking-wide text-bronze-300 hover:text-bronze-300/80 transition-colors duration-500 disabled:opacity-30 whitespace-nowrap shrink-0"
          >
            {loading ? 'Searching…' : 'Explore →'}
          </button>
        </div>
      </form>

      {/* Suggestions */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
        {suggestions.map((word) => (
          <button
            key={word}
            onClick={() => {
              setQuery(word);
              cursorPos.current = word.length;
              if (onSearch) {
                onSearch(word);
              }
            }}
            className="font-tamil text-sm text-parchment-300/40 hover:text-bronze-300 transition-colors duration-500"
          >
            {word}
          </button>
        ))}
      </div>

      {keyboardOpen && (
        <TamilKeyboard
          onInsert={insertAtCursor}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onClose={() => setKeyboardOpen(false)}
          inputValue={query}
        />
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 px-4 py-3 border border-bronze-400/15 text-bronze-400/70 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
