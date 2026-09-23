import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import {
  getWord,
  getWordFamily,
  getWordConstellation,
  parseWordMetadata,
  parseFamily,
  parseConstellation,
  BackendUnavailableError,
  type WordMetadata,
  type ParsedFamilyMember,
  type ParsedConstellation,
} from '@/api';
import ConstellationChart from '@/components/ConstellationChart';
import SearchBox from '@/components/SearchBox';

interface WordExplorerProps {
  word: string;
  onBack: () => void;
  onNavigate: (word: string) => void;
}

type Status = 'loading' | 'loaded' | 'error' | 'empty';

export default function WordExplorer({ word, onBack, onNavigate }: WordExplorerProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [meta, setMeta] = useState<WordMetadata | null>(null);
  const [family, setFamily] = useState<ParsedFamilyMember[]>([]);
  const [constellation, setConstellation] = useState<ParsedConstellation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = useCallback(async (w: string) => {
    setStatus('loading');
    setMeta(null);
    setFamily([]);
    setConstellation(null);
    setErrorMsg('');

    const controller = new AbortController();

    let wordMeta: WordMetadata | null = null;
    let hasAny = false;

    try {
      const wordData = await getWord(w, controller.signal);
      wordMeta = parseWordMetadata(w, wordData);
      setMeta(wordMeta);
      hasAny = true;
    } catch (err) {
      if (err instanceof BackendUnavailableError) {
        setStatus('error');
        setErrorMsg('Backend unavailable — the Tamil semantic API could not be reached at http://127.0.0.1:8000');
        return;
      }
    }

    // Fetch family and constellation in parallel (don't fail if word fetch succeeded)
    const [familyResult, constResult] = await Promise.allSettled([
      getWordFamily(w, controller.signal),
      getWordConstellation(w, controller.signal),
    ]);

    if (familyResult.status === 'fulfilled') {
      const fam = parseFamily(familyResult.value);
      if (fam.length > 0) {
        setFamily(fam);
        hasAny = true;
      }
    }

    if (constResult.status === 'fulfilled') {
      const con = parseConstellation(w, constResult.value);
      if (con.nodes.length > 0) {
        setConstellation(con);
        hasAny = true;
      }
    }

    if (hasAny) {
      setStatus('loaded');
    } else {
      setStatus('empty');
      setErrorMsg('No data returned for this word.');
    }
  }, []);

  useEffect(() => {
    loadData(word);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [word, loadData]);

  const conCenter = constellation?.center ?? word;
  const conNodes = constellation?.nodes ?? [];

  return (
    <div className="min-h-screen bg-ink-950 grain">
      {/* Top bar with back link */}
      <div className="sticky top-0 z-40 bg-ink-950/85 backdrop-blur-md border-b border-white/[0.04]">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[13px] text-parchment-300/50 hover:text-bronze-300 transition-colors duration-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to archive
          </button>
          <span className="font-serif text-sm tracking-[0.15em] text-parchment-100">SOL-VANAM</span>
        </div>
      </div>

      {/* Loading state */}
      {status === 'loading' && (
        <div className="py-40 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-bronze-400/40 animate-twinkle" />
            <span className="font-serif italic text-lg text-parchment-300/50">Tracing the semantic field…</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="py-40 px-6">
          <div className="max-w-lg mx-auto text-center">
            <AlertCircle className="w-6 h-6 text-bronze-400/50 mx-auto mb-4" />
            <p className="font-serif text-xl text-parchment-200/70 mb-2">Backend unavailable</p>
            <p className="text-sm text-parchment-300/40 leading-relaxed mb-8">{errorMsg}</p>
            <button
              onClick={() => loadData(word)}
              className="text-[13px] text-bronze-300/80 hover:text-bronze-300 transition-colors duration-500 border-b border-bronze-400/20 hover:border-bronze-400/50 pb-0.5"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {status === 'empty' && (
        <div className="py-40 px-6">
          <div className="max-w-lg mx-auto text-center">
            <p className="font-serif text-xl text-parchment-200/70 mb-2">No results found</p>
            <p className="text-sm text-parchment-300/40 leading-relaxed mb-8">
              The backend returned no data for "{word}". Try a different word.
            </p>
            <div className="max-w-md mx-auto">
              <SearchBox variant="minimal" onResult={() => {}} />
            </div>
          </div>
        </div>
      )}

      {/* Loaded content */}
      {status === 'loaded' && (
        <div className="animate-fade-in">
          {/* Word header */}
          <section className="relative pt-24 pb-16 grain">
            <div className="absolute inset-0 starfield opacity-30" />
            <div className="relative mx-auto max-w-4xl px-6 lg:px-10 text-center">
              <div className="eyebrow mb-6">Word Entry</div>

              <h1 className="font-tamil text-5xl lg:text-7xl text-parchment-100 mb-4">
                {word}
              </h1>

              {meta?.pos && (
                <div className="eyebrow mb-4">{meta.pos}</div>
              )}

              {meta?.gloss && (
                <p className="font-serif text-lg lg:text-xl italic text-parchment-300/60 max-w-lg mx-auto leading-relaxed">
                  {meta.gloss}
                </p>
              )}

              {/* Definitions */}
              {meta && meta.definitions.length > 0 && (
                <div className="mt-10 max-w-xl mx-auto">
                  <div className="eyebrow mb-4">Definitions</div>
                  <div className="space-y-3">
                    {meta.definitions.map((def, i) => (
                      <p key={i} className="font-serif text-base text-parchment-200/70 leading-relaxed">
                        {def}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Thin divider */}
              <div className="flex items-center justify-center mt-12">
                <div className="h-px w-16 bg-bronze-400/15" />
                <svg width="16" height="16" viewBox="0 0 16 16" className="text-bronze-400/30 mx-3">
                  <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                  <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
                </svg>
                <div className="h-px w-16 bg-bronze-400/15" />
              </div>
            </div>
          </section>

          {/* Lexical family — typographic word field */}
          {family.length > 0 && (
            <section className="relative py-24 grain">
              <div className="mx-auto max-w-4xl px-6 lg:px-10">
                <div className="text-center mb-4">
                  <span className="eyebrow">Lexical Family</span>
                </div>
                <h2 className="font-serif text-2xl lg:text-3xl text-parchment-100 text-center mb-4">
                  Morphological field
                </h2>
                <p className="font-serif italic text-sm text-parchment-300/40 text-center mb-12 max-w-md mx-auto">
                  Related lexical forms derived from the same root.
                </p>

                {/* Typographic word field — varying sizes, no cards */}
                <div className="flex flex-wrap justify-center items-baseline gap-x-6 gap-y-4 max-w-2xl mx-auto">
                  {family.map((member, i) => {
                    const sizeClass =
                      i === 0 ? 'text-3xl' :
                      i < 3 ? 'text-2xl' :
                      i < 6 ? 'text-xl' :
                      'text-lg';
                    const opacityClass =
                      i === 0 ? 'text-parchment-100' :
                      i < 3 ? 'text-parchment-200/80' :
                      i < 6 ? 'text-parchment-300/60' :
                      'text-parchment-300/40';
                    return (
                      <span
                        key={`${member.text}-${i}`}
                        className={`font-tamil ${sizeClass} ${opacityClass} hover:text-bronze-300 transition-colors duration-700 cursor-default`}
                        title={member.sub}
                      >
                        {member.text}
                        {i < family.length - 1 && (
                          <span className="text-bronze-400/15 ml-3">·</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Semantic constellation — data-driven star chart */}
          {conNodes.length > 0 && (
            <section className="relative py-24 lg:py-32 overflow-hidden grain">
              <div className="absolute inset-0 starfield opacity-40" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-bronze-400/[0.02] blur-[100px]" />

              <div className="relative mx-auto max-w-3xl px-6 lg:px-10">
                <div className="text-center mb-4">
                  <span className="eyebrow">Semantic Constellation</span>
                </div>
                <h2 className="font-serif text-2xl lg:text-3xl text-parchment-100 text-center mb-4">
                  Contextual relationships
                </h2>
                <p className="font-serif italic text-sm text-parchment-300/40 text-center mb-16 max-w-md mx-auto">
                  Distributional patterns derived from corpus evidence —
                  not dictionary equivalences.
                </p>

                {/* Chart frame */}
                <div className="relative max-w-xl mx-auto">
                  <div className="absolute inset-0 border border-bronze-400/[0.06] rounded-sm" />
                  {[
                    { top: '-4px', left: '-4px', borderT: 'border-t', borderL: 'border-l' },
                    { top: '-4px', right: '-4px', borderT: 'border-t', borderR: 'border-r' },
                    { bottom: '-4px', left: '-4px', borderB: 'border-b', borderL: 'border-l' },
                    { bottom: '-4px', right: '-4px', borderB: 'border-b', borderR: 'border-r' },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={`absolute w-3 h-3 border-bronze-400/30 ${c.borderT || ''} ${c.borderL || ''} ${c.borderR || ''} ${c.borderB || ''}`}
                      style={{ top: c.top, left: c.left, right: c.right, bottom: c.bottom }}
                    />
                  ))}

                  <ConstellationChart center={conCenter} nodes={conNodes} />

                  {/* Chart metadata */}
                  <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-parchment-300/20">
                    <span>semantic constellation · {conNodes.length} nodes</span>
                    <span>corpus-derived</span>
                  </div>
                </div>

                <p className="mt-12 font-serif italic text-sm text-parchment-300/40 text-center max-w-lg mx-auto leading-relaxed">
                  Semantic relationships emerge from patterns of contextual usage
                  across the corpus. These clusters represent distributional
                  patterns, not confirmed dictionary senses.
                </p>
              </div>
            </section>
          )}

          {/* Historical vs Modern — editorial comparison */}
          <section className="relative py-24 grain">
            <div className="mx-auto max-w-4xl px-6 lg:px-10">
              <div className="text-center mb-4">
                <span className="eyebrow">Historical &amp; Modern Context</span>
              </div>
              <h2 className="font-serif text-2xl lg:text-3xl text-parchment-100 text-center mb-16">
                Across literary periods
              </h2>

              <div className="relative max-w-2xl mx-auto">
                {/* Continuous vertical line */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-bronze-400/20 via-bronze-400/15 to-bronze-400/20" />

                {/* Historical */}
                <div className="relative grid grid-cols-2 gap-12 mb-16">
                  <div className="text-right pr-8">
                    <div className="eyebrow mb-3">Historical</div>
                    <h3 className="font-serif text-lg text-parchment-100 mb-2">Classical literary contexts</h3>
                    <p className="text-sm text-parchment-300/40 leading-relaxed">
                      Usage patterns drawn from Sangam, classical, and Bhakti literature —
                      the earliest strata of Tamil textual tradition.
                    </p>
                  </div>
                  <div className="flex items-center justify-start pl-8">
                    <div className="w-3 h-3 rounded-full bg-bronze-400/30 ring-4 ring-ink-950" />
                  </div>
                </div>

                {/* Modern */}
                <div className="relative grid grid-cols-2 gap-12">
                  <div className="flex items-center justify-end pr-8">
                    <div className="w-3 h-3 rounded-full bg-bronze-400/30 ring-4 ring-ink-950" />
                  </div>
                  <div className="text-left pl-8">
                    <div className="eyebrow mb-3">Modern</div>
                    <h3 className="font-serif text-lg text-parchment-100 mb-2">Living corpus contexts</h3>
                    <p className="text-sm text-parchment-300/40 leading-relaxed">
                      Distributional matches from contemporary Tamil — possible modern
                      relations that may reflect semantic shifts over time.
                    </p>
                  </div>
                </div>

                {/* Scientific disclaimer */}
                <div className="mt-16 text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="h-px w-8 bg-bronze-400/10" />
                    <span className="text-[10px] font-mono text-parchment-300/25 tracking-wider">note</span>
                    <div className="h-px w-8 bg-bronze-400/10" />
                  </div>
                  <p className="font-serif italic text-xs text-parchment-300/30 max-w-md mx-auto leading-relaxed">
                    Semantic similarity does not automatically imply a dictionary-equivalent
                    meaning. Modern matches represent distributional patterns, not confirmed
                    semantic equivalences.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Continue exploring */}
          <section className="relative py-24 grain border-t border-white/[0.04]">
            <div className="mx-auto max-w-2xl px-6 text-center">
              <p className="font-serif italic text-base text-parchment-300/40 mb-6">
                Explore another word…
              </p>
              <SearchBox
                variant="minimal"
                onResult={(data) => {
                  if (data && typeof data === 'object' && 'word' in data) {
                    const w = (data as Record<string, unknown>).word;
                    if (typeof w === 'string') onNavigate(w);
                  }
                }}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
