import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getHistoricalModern,
  getWord,
  parseFamily,
  displayValue,
  type HistoricalModernResponse,
} from '../api';

// ============================================================
// TYPES
// ============================================================

type WordExplorerProps = {
  word: string;
  onBack: () => void;
  onNavigate?: (word: string) => void;
  onSearch?: (word: string) => void;
};

type AnyRecord = Record<string, unknown>;

type Representative = {
  passage_id: string;
  passage_index?: number;
  work: string;
  era: string;
  era_raw: string;
  reference: string;
  source: string;
  license: string;
  context: string;
  matched_form: string;
  passage_text: string;
  n_matches_in_passage?: number;
  match_position?: number;
  token_index?: number;
  duplicate_count?: number;
  also_in: string[];
  similarity?: number;
  selection: string;
  passage_text_truncated?: boolean;
};

type Cluster = {
  cluster_id?: number;
  label?: string;
  cluster_kind?: string;
  is_validated_sense?: boolean;
  size?: number;
  share?: number;
  minor_cluster?: boolean;
  era_counts?: Record<string, number>;
  form_counts?: Record<string, number>;
  top_works?: unknown[];
  top_collocates?: unknown[];
  representatives?: Representative[];
};

type Position = {
  x: number;
  y: number;
};

// ============================================================
// SAFE HELPERS
// ============================================================

function asRecord(
  value: unknown,
): AnyRecord {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as AnyRecord;
  }

  return {};
}

function asString(
  value: unknown,
  fallback = '',
): string {
  return typeof value === 'string'
    ? value
    : fallback;
}

function asNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function asArray(
  value: unknown,
): unknown[] {
  return Array.isArray(value)
    ? value
    : [];
}

function cleanList(
  values: unknown[],
  limit = 8,
): string[] {
  const result: string[] = [];

  for (const value of values) {
    const text =
      displayValue(value).trim();

    if (
      text &&
      !result.includes(text)
    ) {
      result.push(text);
    }

    if (
      result.length >= limit
    ) {
      break;
    }
  }

  return result;
}

function truncate(
  text: string,
  length = 280,
): string {
  const clean = text
    .replace(/\s+/g, ' ')
    .trim();

  if (
    clean.length <= length
  ) {
    return clean;
  }

  return `${clean
    .slice(0, length)
    .trim()}…`;
}

// ============================================================
// REPRESENTATIVE PARSING
// ============================================================

function parseRepresentative(
  value: unknown,
): Representative | null {
  const item =
    asRecord(value);

  const context =
    asString(item.context);

  const passageText =
    asString(item.passage_text);

  const work =
    asString(item.work);

  const era =
    asString(item.era);

  const source =
    asString(item.source);

  if (
    !context &&
    !passageText &&
    !work
  ) {
    return null;
  }

  return {
    passage_id:
      asString(item.passage_id),

    passage_index:
      typeof item.passage_index ===
      'number'
        ? item.passage_index
        : undefined,

    work,

    era,

    era_raw:
      asString(item.era_raw),

    reference:
      asString(item.reference),

    source,

    license:
      asString(item.license),

    context,

    matched_form:
      asString(item.matched_form),

    passage_text:
      passageText,

    n_matches_in_passage:
      typeof item.n_matches_in_passage ===
      'number'
        ? item.n_matches_in_passage
        : undefined,

    match_position:
      typeof item.match_position ===
      'number'
        ? item.match_position
        : undefined,

    token_index:
      typeof item.token_index ===
      'number'
        ? item.token_index
        : undefined,

    duplicate_count:
      typeof item.duplicate_count ===
      'number'
        ? item.duplicate_count
        : undefined,

    also_in:
      asArray(item.also_in)
        .map((entry) =>
          asString(entry),
        )
        .filter(Boolean),

    similarity:
      typeof item.similarity ===
      'number'
        ? item.similarity
        : undefined,

    selection:
      asString(
        item.selection,
      ),

    passage_text_truncated:
      item.passage_text_truncated ===
      true,
  };
}

function parseRepresentatives(
  value: unknown,
  limit = 4,
): Representative[] {
  return asArray(value)
    .map(parseRepresentative)
    .filter(
      (
        item,
      ): item is Representative =>
        item !== null,
    )
    .slice(0, limit);
}

// ============================================================
// CLUSTER PARSING
// ============================================================

function parseClusters(
  wordData: unknown,
): Cluster[] {
  const data =
    asRecord(wordData);

  return asArray(
    data.clusters,
  )
    .map((item) => {
      const cluster =
        asRecord(item);

      const eraCounts =
        asRecord(
          cluster.era_counts,
        );

      const formCounts =
        asRecord(
          cluster.form_counts,
        );

      return {
        cluster_id:
          typeof cluster.cluster_id ===
          'number'
            ? cluster.cluster_id
            : undefined,

        label:
          asString(
            cluster.label,
          ),

        cluster_kind:
          asString(
            cluster.cluster_kind,
          ),

        is_validated_sense:
          cluster.is_validated_sense ===
          true,

        size:
          asNumber(
            cluster.size,
          ),

        share:
          asNumber(
            cluster.share,
          ),

        minor_cluster:
          cluster.minor_cluster ===
          true,

        era_counts:
          Object.entries(
            eraCounts,
          ).reduce(
            (
              result,
              [key, value],
            ) => {
              const number =
                asNumber(value);

              if (number > 0) {
                result[key] =
                  number;
              }

              return result;
            },
            {} as Record<
              string,
              number
            >,
          ),

        form_counts:
          Object.entries(
            formCounts,
          ).reduce(
            (
              result,
              [key, value],
            ) => {
              const number =
                asNumber(value);

              if (number > 0) {
                result[key] =
                  number;
              }

              return result;
            },
            {} as Record<
              string,
              number
            >,
          ),

        top_works:
          asArray(
            cluster.top_works,
          ),

        top_collocates:
          asArray(
            cluster.top_collocates,
          ),

        representatives:
          parseRepresentatives(
            cluster.representatives,
            4,
          ),
      };
    })
    .filter(
      (cluster) =>
        (cluster.size ?? 0) >
          0 ||
        Boolean(cluster.label),
    );
}

// ============================================================
// HISTORICAL / MODERN
// ============================================================

function parseHistoricalContexts(
  result:
    | HistoricalModernResponse
    | null,
): unknown[] {
  if (!result) {
    return [];
  }

  return asArray(
    result.historical_contexts,
  );
}

function parseModernContexts(
  result:
    | HistoricalModernResponse
    | null,
): unknown[] {
  if (!result) {
    return [];
  }

  return asArray(
    result.modern_context_matches,
  );
}

// ============================================================
// FORMATTING
// ============================================================

function formatShare(
  share: number,
): string {
  if (!share) {
    return '0%';
  }

  const percentage =
    share <= 1
      ? share * 100
      : share;

  return `${percentage.toFixed(1)}%`;
}

function humanEraName(
  era: string,
): string {
  const normalized =
    era
      .trim()
      .toLowerCase();

  const names: Record<
    string,
    string
  > = {
    ancient: 'Ancient',
    classical: 'Classical',
    medieval: 'Medieval',
    bhakti: 'Bhakti',
    later: 'Later Literature',
    modern: 'Modern Tamil',
    'modern tamil': 'Modern Tamil',
  };

  return (
    names[normalized] ??
    (era
      ? era.charAt(0).toUpperCase() +
        era.slice(1)
      : 'Unknown')
  );
}

function getClusterTitle(
  cluster: Cluster,
  index: number,
): string {
  const label =
    cluster.label?.trim();

  if (
    label &&
    !/^cluster[-_\s]?\d+$/i.test(
      label,
    )
  ) {
    return label;
  }

  return `Semantic Field ${String(
    index + 1,
  ).padStart(2, '0')}`;
}

function getClusterShortTitle(
  cluster: Cluster,
  index: number,
): string {
  const label =
    cluster.label?.trim();

  if (
    label &&
    !/^cluster[-_\s]?\d+$/i.test(
      label,
    )
  ) {
    return label;
  }

  return `FIELD ${String(
    index + 1,
  ).padStart(2, '0')}`;
}

// ============================================================
// CONSTELLATION GEOMETRY
// ============================================================

function getClusterPosition(
  index: number,
  total: number,
): Position {
  const angle =
    -Math.PI / 2 +
    (index /
      Math.max(total, 1)) *
      Math.PI *
      2;

  const radius =
    total <= 2
      ? 28
      : total <= 4
        ? 32
        : 36;

  return {
    x:
      50 +
      Math.cos(angle) *
        radius,

    y:
      50 +
      Math.sin(angle) *
        radius,
  };
}

function getSatellitePosition(
  clusterPosition: Position,
  index: number,
  total: number,
  clusterIndex: number,
  clusterTotal: number,
): Position {
  const clusterAngle =
    -Math.PI / 2 +
    (clusterIndex /
      Math.max(
        clusterTotal,
        1,
      )) *
      Math.PI *
      2;

  const offset =
    total <= 1
      ? 0
      : ((index -
          (total - 1) / 2) /
          Math.max(
            total - 1,
            1,
          )) *
        0.8;

  const angle =
    clusterAngle +
    offset;

  const radius =
    13 +
    Math.min(total, 5) *
      1.1;

  return {
    x:
      clusterPosition.x +
      Math.cos(angle) *
        radius,

    y:
      clusterPosition.y +
      Math.sin(angle) *
        radius,
  };
}

// ============================================================
// HIGHLIGHT MATCHED WORD
// ============================================================

function renderHighlightedContext(
  text: string,
  matchedForm: string,
) {
  if (
    !text ||
    !matchedForm
  ) {
    return text;
  }

  const escaped =
    matchedForm.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

  const parts =
    text.split(
      new RegExp(
        `(${escaped})`,
        'gi',
      ),
    );

  return parts.map(
    (part, index) =>
      part.toLowerCase() ===
      matchedForm.toLowerCase() ? (
        <span
          key={index}
          className="text-[#d7b96d] not-italic"
        >
          {part}
        </span>
      ) : (
        <span key={index}>
          {part}
        </span>
      ),
  );
}

// ============================================================
// COMPONENT
// ============================================================

export default function WordExplorer({
  word,
  onBack,
  onNavigate,
  onSearch,
}: WordExplorerProps) {
  const [wordData, setWordData] =
    useState<unknown>(null);

  const [
    historicalModern,
    setHistoricalModern,
  ] =
    useState<HistoricalModernResponse | null>(
      null,
    );

  const [
    mainStatus,
    setMainStatus,
  ] =
    useState<
      'loading' |
      'loaded' |
      'error'
    >('loading');

  const [
    historicalStatus,
    setHistoricalStatus,
  ] =
    useState<
      | 'idle'
      | 'loading'
      | 'loaded'
      | 'error'
    >('idle');

  const [
    selectedCluster,
    setSelectedCluster,
  ] = useState(0);

  const [
    searchWord,
    setSearchWord,
  ] = useState('');

  // ----------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------

  const navigateToWord = (
    nextWord: string,
  ) => {
    const clean =
      nextWord.trim();

    if (!clean) {
      return;
    }

    if (onNavigate) {
      onNavigate(clean);
      return;
    }

    onSearch?.(clean);
  };

  // ----------------------------------------------------------
  // Fetch word
  // ----------------------------------------------------------

  useEffect(() => {
    const controller =
      new AbortController();

    const trimmedWord =
      word.trim();

    setWordData(null);
    setHistoricalModern(null);
    setSelectedCluster(0);

    setMainStatus('loading');
    setHistoricalStatus('idle');

    if (!trimmedWord) {
      setMainStatus('error');

      return () =>
        controller.abort();
    }

    getWord(
      trimmedWord,
      controller.signal,
    )
      .then((result) => {
        setWordData(result);
        setMainStatus('loaded');

        setHistoricalStatus(
          'loading',
        );

        return getHistoricalModern(
          trimmedWord,
          controller.signal,
        );
      })
      .then((result) => {
        if (!result) {
          return;
        }

        setHistoricalModern(
          result,
        );

        setHistoricalStatus(
          'loaded',
        );
      })
      .catch((error) => {
        if (
          controller.signal.aborted
        ) {
          return;
        }

        console.error(
          'Historical-modern request failed:',
          error,
        );

        setHistoricalStatus(
          'error',
        );
      });

    return () =>
      controller.abort();
  }, [word]);

  // ----------------------------------------------------------
  // Parsed data
  // ----------------------------------------------------------

  const data =
    asRecord(wordData);

  const normalizedWord =
    asString(
      data.normalized_query,
      word,
    );

  const family = useMemo(() => {
    if (!wordData) {
      return [];
    }

    try {
      return parseFamily(
        wordData as any,
      )
        .map(
          (item) =>
            item.text.trim(),
        )
        .filter(Boolean)
        .filter(
          (
            item,
            index,
            array,
          ) =>
            array.indexOf(item) ===
            index,
        );
    } catch (error) {
      console.error(
        'Failed to parse lexical family:',
        error,
      );

      return [];
    }
  }, [wordData]);

  const clusters = useMemo(
    () =>
      parseClusters(
        wordData,
      ),
    [wordData],
  );

  const activeCluster =
    clusters[
      Math.min(
        selectedCluster,
        Math.max(
          clusters.length - 1,
          0,
        ),
      )
    ];

  const corpus =
    asRecord(data.corpus);

  const corpusPassages =
    asNumber(
      corpus.passages ??
        corpus.total_passages ??
        corpus.contexts,
    );

  const warnings =
    cleanList(
      asArray(data.warnings),
      4,
    );

  const historicalContexts =
    parseHistoricalContexts(
      historicalModern,
    );

  const modernContexts =
    parseModernContexts(
      historicalModern,
    );

  const historicalCount =
    asNumber(
      historicalModern?.historical_context_count,
      historicalContexts.length,
    );

  const modernCount =
    modernContexts.length;

  // ----------------------------------------------------------
  // Aggregate eras
  // ----------------------------------------------------------

  const eraTotals = useMemo(() => {
    const totals: Record<
      string,
      number
    > = {};

    for (const cluster of clusters) {
      for (const [
        era,
        count,
      ] of Object.entries(
        cluster.era_counts ?? {},
      )) {
        totals[era] =
          (totals[era] ?? 0) +
          count;
      }
    }

    return Object.entries(
      totals,
    )
      .filter(
        ([, count]) =>
          count > 0,
      )
      .sort(
        (a, b) =>
          b[1] - a[1],
      );
  }, [clusters]);

  const totalOccurrences =
    clusters.reduce(
      (
        sum,
        cluster,
      ) =>
        sum +
        (cluster.size ?? 0),
      0,
    );

  // ----------------------------------------------------------
  // Active cluster
  // ----------------------------------------------------------

  const activeCollocates =
    activeCluster
      ? cleanList(
          activeCluster.top_collocates ??
            [],
          7,
        )
      : [];

  const activeWorks =
    activeCluster
      ? cleanList(
          activeCluster.top_works ??
            [],
          6,
        )
      : [];

  const activeRepresentatives =
    activeCluster
      ? activeCluster.representatives ??
        []
      : [];

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    mainStatus ===
    'loading'
  ) {
    return (
      <main className="min-h-screen bg-[#070b13] text-[#e8dfcc]">
        <header className="border-b border-[#b69b63]/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
            <button
              onClick={onBack}
              className="text-sm text-[#8f887b] transition hover:text-[#d1b878]"
            >
              ← Back to archive
            </button>

            <span className="font-serif text-sm tracking-[0.28em] text-[#d6c9ae]">
              SOL-VANAM
            </span>
          </div>
        </header>

        <section className="flex min-h-[80vh] items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-8 h-2 w-2 animate-pulse rounded-full bg-[#c9a96a] shadow-[0_0_25px_rgba(201,169,106,0.6)]" />

            <div className="text-[10px] tracking-[0.45em] text-[#a88d56]">
              TRACING THE WORD
            </div>

            <h1 className="mt-6 font-serif text-5xl text-[#e5ddcd]">
              {word}
            </h1>

            <p className="mt-5 font-serif italic text-[#756f64]">
              Reading its literary traces…
            </p>
          </div>
        </section>
      </main>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    mainStatus ===
      'error' ||
    !wordData
  ) {
    return (
      <main className="min-h-screen bg-[#070b13] text-[#e8dfcc]">
        <header className="border-b border-[#b69b63]/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
            <button
              onClick={onBack}
              className="text-sm text-[#9e947f] transition hover:text-[#d1b878]"
            >
              ← Back to archive
            </button>

            <span className="font-serif text-sm tracking-[0.28em] text-[#d6c9ae]">
              SOL-VANAM
            </span>
          </div>
        </header>

        <section className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="text-center">
            <div className="mb-5 text-[10px] tracking-[0.4em] text-[#a88d56]">
              WORD NOT FOUND
            </div>

            <h1 className="font-serif text-4xl text-[#e5ddcd]">
              Unable to trace this word.
            </h1>

            <button
              onClick={onBack}
              className="mt-8 border-b border-[#a88d56]/50 pb-1 text-sm text-[#bda76f]"
            >
              Return to archive
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b13] text-[#e8dfcc]">
      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-[#b69b63]/10 bg-[#070b13]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            onClick={onBack}
            className="text-sm text-[#8f887b] transition hover:text-[#d1b878]"
          >
            ← Archive
          </button>

          <span className="font-serif text-sm tracking-[0.3em] text-[#d6c9ae]">
            SOL-VANAM
          </span>

          <span className="hidden text-[9px] tracking-[0.3em] text-[#5f5a52] sm:block">
            WORD EXPLORATION
          </span>
        </div>
      </header>

      {/* WORD IDENTITY */}

      <section className="relative px-6 pb-20 pt-24">
        <div className="pointer-events-none absolute left-1/2 top-12 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#a88d56]/50 to-transparent" />

        <div className="mx-auto max-w-5xl text-center">
          <div className="text-[10px] tracking-[0.5em] text-[#a88d56]">
            A WORD, TRACED THROUGH TIME
          </div>

          <h1 className="mt-7 font-serif text-6xl leading-none text-[#eee6d6] md:text-8xl">
            {normalizedWord}
          </h1>

          <p className="mx-auto mt-8 max-w-2xl font-serif text-lg italic leading-8 text-[#777267]">
            Explore the meanings,
            relationships and literary
            traces surrounding this Tamil
            word.
          </p>

          <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-x-10 gap-y-4 text-[10px] tracking-[0.18em] text-[#716b60]">
            {clusters.length >
              0 && (
              <span>
                {clusters.length}{' '}
                SEMANTIC FIELDS
              </span>
            )}

            {totalOccurrences >
              0 && (
              <span>
                {totalOccurrences.toLocaleString()}{' '}
                CONTEXTUAL OCCURRENCES
              </span>
            )}

            {family.length >
              0 && (
              <span>
                {family.length}{' '}
                LEXICAL FORMS
              </span>
            )}

            {corpusPassages >
              0 && (
              <span>
                {corpusPassages.toLocaleString()}{' '}
                CORPUS PASSAGES
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================
          SEMANTIC CONSTELLATION
      ======================================================= */}

      <section className="relative border-y border-[#b69b63]/10 px-4 py-20 md:px-6 md:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a88d56]/[0.025] blur-[110px]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <div className="text-[10px] tracking-[0.45em] text-[#a88d56]">
              SEMANTIC CONSTELLATION
            </div>

            <h2 className="mt-5 font-serif text-4xl text-[#e5ddcd] md:text-5xl">
              Meanings orbit the word
            </h2>

            <p className="mx-auto mt-5 max-w-2xl font-serif italic leading-7 text-[#706b62]">
              Each field gathers contexts in
              which the word takes on a
              distinct literary meaning.
            </p>
          </div>

          {clusters.length ===
          0 ? (
            <div className="mx-auto mt-20 max-w-xl border-t border-[#b69b63]/10 pt-8 text-center font-serif italic text-[#676158]">
              No semantic constellation
              was generated for this word.
            </div>
          ) : (
            <>
              {/* CONSTELLATION MAP */}

              <div className="mx-auto mt-14 max-w-6xl">
                <div className="relative aspect-square overflow-hidden rounded-[50%] border border-[#b69b63]/10 bg-[#080e17] sm:aspect-[1.45/1]">
                  <div className="pointer-events-none absolute inset-0 opacity-50">
                    <div className="absolute left-1/2 top-1/2 h-[82%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a96a]/[0.055]" />

                    <div className="absolute left-1/2 top-1/2 h-[61%] w-[61%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a96a]/[0.055]" />

                    <div className="absolute left-1/2 top-1/2 h-[39%] w-[39%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a96a]/[0.05]" />

                    <div className="absolute left-1/2 top-1/2 h-[16%] w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a96a]/[0.06]" />
                  </div>

                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="8"
                      y1="50"
                      x2="92"
                      y2="50"
                      stroke="rgba(201,169,106,0.035)"
                      strokeWidth="0.12"
                    />

                    <line
                      x1="50"
                      y1="8"
                      x2="50"
                      y2="92"
                      stroke="rgba(201,169,106,0.035)"
                      strokeWidth="0.12"
                    />

                    {clusters.map(
                      (
                        cluster,
                        index,
                      ) => {
                        const p =
                          getClusterPosition(
                            index,
                            clusters.length,
                          );

                        const selected =
                          selectedCluster ===
                          index;

                        return (
                          <line
                            key={`main-link-${index}`}
                            x1="50"
                            y1="50"
                            x2={p.x}
                            y2={p.y}
                            stroke={
                              selected
                                ? 'rgba(218,185,104,0.62)'
                                : 'rgba(201,169,106,0.16)'
                            }
                            strokeWidth={
                              selected
                                ? '0.32'
                                : '0.15'
                            }
                            strokeDasharray={
                              selected
                                ? undefined
                                : '1.2 1.5'
                            }
                          />
                        );
                      },
                    )}

                    {[
                      [13, 20],
                      [83, 17],
                      [20, 76],
                      [79, 78],
                      [31, 13],
                      [68, 87],
                      [90, 46],
                      [8, 58],
                    ].map(
                      ([x, y], index) => (
                        <circle
                          key={`star-${index}`}
                          cx={x}
                          cy={y}
                          r={
                            index % 3 ===
                            0
                              ? '0.28'
                              : '0.18'
                          }
                          fill="rgba(210,181,110,0.45)"
                        />
                      ),
                    )}
                  </svg>

                  {/* CENTER WORD */}

                  <div className="absolute left-1/2 top-1/2 z-30 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#d0b36b]/45 bg-[#09101a]/95 shadow-[0_0_80px_rgba(201,169,106,0.14)] sm:h-40 sm:w-40">
                    <div className="text-center">
                      <div className="font-serif text-3xl text-[#eee6d6] sm:text-4xl">
                        {normalizedWord}
                      </div>

                      <div className="mt-3 text-[7px] tracking-[0.35em] text-[#8b7650]">
                        SOURCE WORD
                      </div>
                    </div>
                  </div>

                  {/* CLUSTERS */}

                  {clusters.map(
                    (
                      cluster,
                      clusterIndex,
                    ) => {
                      const clusterPosition =
                        getClusterPosition(
                          clusterIndex,
                          clusters.length,
                        );

                      const selected =
                        selectedCluster ===
                        clusterIndex;

                      const percentage =
                        cluster.share
                          ? cluster.share <=
                            1
                            ? cluster.share *
                              100
                            : cluster.share
                          : 0;

                      const size =
                        Math.max(
                          66,
                          Math.min(
                            112,
                            66 +
                              percentage *
                                0.8,
                          ),
                        );

                      const collocates =
                        cleanList(
                          cluster.top_collocates ??
                            [],
                          5,
                        );

                      return (
                        <div
                          key={
                            cluster.cluster_id ??
                            `cluster-${clusterIndex}`
                          }
                          className="absolute z-20"
                          style={{
                            left: `${clusterPosition.x}%`,
                            top: `${clusterPosition.y}%`,
                            transform:
                              'translate(-50%, -50%)',
                          }}
                        >
                          <svg
                            className="pointer-events-none absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 overflow-visible"
                            viewBox="0 0 230 230"
                          >
                            {collocates.map(
                              (
                                _word,
                                itemIndex,
                              ) => {
                                const angle =
                                  -Math.PI / 2 +
                                  (clusterIndex /
                                    Math.max(
                                      clusters.length,
                                      1,
                                    )) *
                                    Math.PI *
                                    2;

                                const spread =
                                  collocates.length <=
                                  1
                                    ? 0
                                    : ((itemIndex -
                                        (collocates.length -
                                          1) /
                                          2) /
                                        Math.max(
                                          collocates.length -
                                            1,
                                          1,
                                        )) *
                                      0.8;

                                const finalAngle =
                                  angle +
                                  spread;

                                const radius =
                                  76;

                                const x =
                                  115 +
                                  Math.cos(
                                    finalAngle,
                                  ) *
                                    radius;

                                const y =
                                  115 +
                                  Math.sin(
                                    finalAngle,
                                  ) *
                                    radius;

                                return (
                                  <line
                                    key={`sat-line-${itemIndex}`}
                                    x1="115"
                                    y1="115"
                                    x2={x}
                                    y2={y}
                                    stroke={
                                      selected
                                        ? 'rgba(201,169,106,0.22)'
                                        : 'rgba(201,169,106,0.08)'
                                    }
                                    strokeWidth="0.6"
                                  />
                                );
                              },
                            )}
                          </svg>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCluster(
                                clusterIndex,
                              )
                            }
                            aria-label={`Select ${getClusterTitle(
                              cluster,
                              clusterIndex,
                            )}`}
                            className={`relative flex items-center justify-center rounded-full border font-serif transition-all duration-500 ${
                              selected
                                ? 'border-[#d8b96d]/80 bg-[#151b25] text-[#f0e7d6] shadow-[0_0_55px_rgba(201,169,106,0.25)]'
                                : 'border-[#b69b63]/25 bg-[#0b111b]/95 text-[#aaa08e] hover:border-[#b69b63]/55 hover:text-[#ddd4c3]'
                            }`}
                            style={{
                              width: `${size}px`,
                              height: `${size}px`,
                            }}
                          >
                            {selected && (
                              <span className="pointer-events-none absolute -inset-3 rounded-full border border-[#c9a96a]/10" />
                            )}

                            <span className="max-w-[88px] px-2 text-center text-[11px] leading-4">
                              {getClusterShortTitle(
                                cluster,
                                clusterIndex,
                              )}
                            </span>

                            <span className="absolute -bottom-6 whitespace-nowrap text-[8px] tracking-[0.15em] text-[#766e61]">
                              {formatShare(
                                cluster.share ??
                                  0,
                              )}
                            </span>
                          </button>

                          {collocates.map(
                            (
                              relatedWord,
                              itemIndex,
                            ) => {
                              const p =
                                getSatellitePosition(
                                  clusterPosition,
                                  itemIndex,
                                  collocates.length,
                                  clusterIndex,
                                  clusters.length,
                                );

                              return (
                                <button
                                  type="button"
                                  key={`${relatedWord}-${itemIndex}`}
                                  onClick={() =>
                                    navigateToWord(
                                      relatedWord,
                                    )
                                  }
                                  className={`absolute whitespace-nowrap font-serif text-[10px] transition ${
                                    selected
                                      ? 'text-[#a99b82] hover:text-[#d6b96e]'
                                      : 'text-[#5d5a54] hover:text-[#b9a36e]'
                                  }`}
                                  style={{
                                    left: `${
                                      p.x -
                                      clusterPosition.x
                                    }px`,
                                    top: `${
                                      p.y -
                                      clusterPosition.y
                                    }px`,
                                    transform:
                                      'translate(-50%, -50%)',
                                  }}
                                >
                                  {relatedWord}
                                </button>
                              );
                            },
                          )}
                        </div>
                      );
                    },
                  )}

                  <div className="absolute left-5 top-5 text-[7px] tracking-[0.3em] text-[#71634c]">
                    SEMANTIC MAP
                  </div>

                  <div className="absolute right-5 top-5 text-[7px] tracking-[0.3em] text-[#71634c]">
                    {clusters.length}{' '}
                    FIELDS
                  </div>

                  <div className="absolute bottom-5 left-5 text-[7px] tracking-[0.3em] text-[#71634c]">
                    CORPUS
                  </div>

                  <div className="absolute bottom-5 right-5 text-[10px] text-[#8b7650]">
                    ✦
                  </div>
                </div>
              </div>

              {/* LEGEND */}

              <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-x-8 gap-y-3 text-center text-[8px] tracking-[0.18em] text-[#5f5a52]">
                <span>
                  ● SEMANTIC FIELD
                </span>

                <span>
                  · ASSOCIATED CONTEXT
                </span>

                <span>
                  ✦ SOURCE WORD
                </span>
              </div>

              {/* ==================================================
                  SELECTED FIELD
              =================================================== */}

              {activeCluster && (
                <div className="mx-auto mt-16 max-w-5xl">
                  <div className="border-t border-[#b69b63]/15 pt-10">
                    <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
                      <div>
                        <div className="flex items-center gap-3 text-[9px] tracking-[0.35em] text-[#a88d56]">
                          <span>
                            {String(
                              selectedCluster +
                                1,
                            ).padStart(
                              2,
                              '0',
                            )}
                          </span>

                          <span className="text-[#4d4942]">
                            ·
                          </span>

                          <span>
                            SELECTED SEMANTIC FIELD
                          </span>
                        </div>

                        <h3 className="mt-4 font-serif text-3xl text-[#ded5c5] md:text-4xl">
                          {getClusterTitle(
                            activeCluster,
                            selectedCluster,
                          )}
                        </h3>

                        {activeCluster
                          .cluster_kind && (
                          <p className="mt-3 text-[9px] tracking-[0.18em] text-[#655f55]">
                            {activeCluster.cluster_kind.toUpperCase()}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-10">
                        <div>
                          <div className="font-serif text-3xl text-[#d1b56e]">
                            {formatShare(
                              activeCluster.share ??
                                0,
                            )}
                          </div>

                          <div className="mt-1 text-[8px] tracking-[0.2em] text-[#625d55]">
                            SHARE
                          </div>
                        </div>

                        <div>
                          <div className="font-serif text-3xl text-[#d1b56e]">
                            {(
                              activeCluster.size ??
                              0
                            ).toLocaleString()}
                          </div>

                          <div className="mt-1 text-[8px] tracking-[0.2em] text-[#625d55]">
                            CONTEXTS
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TEMPORAL DISTRIBUTION */}

                    {Object.keys(
                      activeCluster.era_counts ??
                        {},
                    ).length >
                      0 && (
                      <div className="mt-12">
                        <div className="mb-5 text-[9px] tracking-[0.3em] text-[#81745e]">
                          TEMPORAL DISTRIBUTION
                        </div>

                        <div className="space-y-4">
                          {Object.entries(
                            activeCluster.era_counts ??
                              {},
                          )
                            .filter(
                              ([, count]) =>
                                count >
                                0,
                            )
                            .sort(
                              (a, b) =>
                                b[1] -
                                a[1],
                            )
                            .map(
                              ([
                                era,
                                count,
                              ]) => {
                                const max =
                                  Math.max(
                                    ...Object.values(
                                      activeCluster.era_counts ??
                                        {},
                                    ),
                                  );

                                const width =
                                  max >
                                  0
                                    ? (count /
                                        max) *
                                      100
                                    : 0;

                                return (
                                  <div
                                    key={era}
                                    className="grid grid-cols-[105px_1fr_45px] items-center gap-4"
                                  >
                                    <span className="text-[10px] text-[#81796b]">
                                      {humanEraName(
                                        era,
                                      )}
                                    </span>

                                    <div className="h-px bg-[#b69b63]/10">
                                      <div
                                        className="h-px bg-[#bda362]/65 transition-all duration-700"
                                        style={{
                                          width: `${width}%`,
                                        }}
                                      />
                                    </div>

                                    <span className="text-right text-[10px] text-[#70695e]">
                                      {count.toLocaleString()}
                                    </span>
                                  </div>
                                );
                              },
                            )}
                        </div>
                      </div>
                    )}

                    {/* ASSOCIATED CONTEXTS */}

                    {activeCollocates.length >
                      0 && (
                      <div className="mt-12">
                        <div className="mb-5 text-[9px] tracking-[0.3em] text-[#81745e]">
                          ASSOCIATED CONTEXTS
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-5">
                          {activeCollocates.map(
                            (
                              relatedWord,
                            ) => (
                              <button
                                type="button"
                                key={
                                  relatedWord
                                }
                                onClick={() =>
                                  navigateToWord(
                                    relatedWord,
                                  )
                                }
                                className="font-serif text-lg text-[#928978] transition hover:text-[#d0b36b]"
                              >
                                {relatedWord}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* ==================================================
                        LITERARY EVIDENCE
                    =================================================== */}

                    {activeRepresentatives.length >
                      0 && (
                      <div className="mt-16">
                        <div className="flex items-end justify-between gap-6 border-b border-[#b69b63]/10 pb-5">
                          <div>
                            <div className="text-[9px] tracking-[0.3em] text-[#a88d56]">
                              LITERARY EVIDENCE
                            </div>

                            <h4 className="mt-3 font-serif text-2xl text-[#d9d0bf]">
                              The word in context
                            </h4>
                          </div>

                          <div className="hidden text-right text-[8px] tracking-[0.2em] text-[#5f5a52] sm:block">
                            {activeRepresentatives.length}{' '}
                            SELECTED TRACES
                          </div>
                        </div>

                        <div className="mt-8 space-y-7">
                          {activeRepresentatives.map(
                            (
                              evidence,
                              index,
                            ) => (
                              <article
                                key={
                                  evidence.passage_id ||
                                  `${evidence.work}-${index}`
                                }
                                className="group relative overflow-hidden border border-[#b69b63]/10 bg-[#090f18] transition duration-500 hover:border-[#b69b63]/25"
                              >
                                <div className="absolute left-0 top-0 h-full w-px bg-[#a88d56]/40" />

                                <div className="p-6 md:p-8">
                                  {/* Metadata */}

                                  <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                      {evidence.era && (
                                        <span className="text-[8px] tracking-[0.25em] text-[#a88d56]">
                                          {humanEraName(
                                            evidence.era,
                                          ).toUpperCase()}
                                        </span>
                                      )}

                                      {evidence.reference && (
                                        <>
                                          <span className="text-[#4b463e]">
                                            ·
                                          </span>

                                          <span className="text-[8px] tracking-[0.18em] text-[#625c51]">
                                            REF.{' '}
                                            {
                                              evidence.reference
                                            }
                                          </span>
                                        </>
                                      )}
                                    </div>

                                    {typeof evidence.similarity ===
                                      'number' && (
                                      <span className="text-[8px] tracking-[0.16em] text-[#5c574f]">
                                        SEMANTIC MATCH{' '}
                                        {(
                                          evidence.similarity *
                                          100
                                        ).toFixed(
                                          1,
                                        )}
                                        %
                                      </span>
                                    )}
                                  </div>

                                  {/* Work */}

                                  {evidence.work && (
                                    <h5 className="mt-5 font-serif text-xl leading-7 text-[#cfc5b2]">
                                      {evidence.work}
                                    </h5>
                                  )}

                                  {/* Actual occurrence */}

                                  {evidence.context && (
                                    <blockquote className="mt-6 border-l border-[#c9a96a]/30 pl-5 font-serif text-base italic leading-8 text-[#9b9385] md:text-lg">
                                      “
                                      {renderHighlightedContext(
                                        evidence.context,
                                        evidence.matched_form ||
                                          normalizedWord,
                                      )}
                                      ”
                                    </blockquote>
                                  )}

                                  {/* Source */}

                                  <div className="mt-7 flex flex-col gap-3 border-t border-[#b69b63]/[0.08] pt-5 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <div className="text-[8px] tracking-[0.22em] text-[#655f56]">
                                        SOURCE
                                      </div>

                                      <div className="mt-2 break-words text-[10px] leading-5 text-[#716b61]">
                                        {evidence.source ||
                                          'Corpus source not specified'}
                                      </div>
                                    </div>

                                    <div className="shrink-0 text-left sm:text-right">
                                      {typeof evidence.n_matches_in_passage ===
                                        'number' && (
                                        <>
                                          <div className="text-[8px] tracking-[0.18em] text-[#655f56]">
                                            OCCURRENCES
                                          </div>

                                          <div className="mt-2 font-serif text-lg text-[#bda362]">
                                            {
                                              evidence.n_matches_in_passage
                                            }
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Expanded passage */}

                                  {evidence.passage_text &&
                                    evidence.passage_text !==
                                      evidence.context && (
                                      <details className="mt-6 border-t border-[#b69b63]/[0.08] pt-5">
                                        <summary className="cursor-pointer list-none text-[8px] tracking-[0.22em] text-[#756c5d] transition hover:text-[#bda362]">
                                          READ SURROUNDING PASSAGE
                                        </summary>

                                        <p className="mt-5 font-serif text-sm leading-7 text-[#777064]">
                                          {truncate(
                                            evidence.passage_text,
                                            900,
                                          )}
                                        </p>
                                      </details>
                                    )}
                                </div>
                              </article>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* LITERARY SOURCES */}

                    {activeWorks.length >
                      0 && (
                      <div className="mt-14">
                        <div className="mb-5 text-[9px] tracking-[0.3em] text-[#81745e]">
                          LITERARY SOURCES
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-3">
                          {activeWorks.map(
                            (work) => (
                              <span
                                key={
                                  work
                                }
                                className="font-serif text-sm text-[#9b927f]"
                              >
                                {work}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ======================================================
          LEXICAL FAMILY
      ======================================================= */}

      <section className="border-b border-[#b69b63]/10 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-[10px] tracking-[0.4em] text-[#a88d56]">
              LEXICAL FAMILY
            </div>

            <h2 className="mt-5 font-serif text-4xl text-[#e5ddcd]">
              Words growing from the same root
            </h2>

            <p className="mx-auto mt-4 max-w-xl font-serif italic leading-7 text-[#706b62]">
              Morphological relatives found
              through the lexical analysis.
            </p>
          </div>

          {family.length >
          0 ? (
            <div className="relative mx-auto mt-16 flex min-h-[180px] max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-7">
              {family.map(
                (
                  form,
                  index,
                ) => {
                  const isRoot =
                    form ===
                    normalizedWord;

                  return (
                    <button
                      type="button"
                      key={`${form}-${index}`}
                      onClick={() =>
                        navigateToWord(
                          form,
                        )
                      }
                      className={`relative font-serif transition duration-300 ${
                        isRoot
                          ? 'text-2xl text-[#d5b66c] after:absolute after:-inset-3 after:rounded-full after:border after:border-[#b69b63]/20'
                          : index % 4 ===
                              0
                            ? 'text-xl text-[#9f957f] hover:text-[#d0b36b]'
                            : 'text-base text-[#766f64] hover:text-[#c3aa70]'
                      }`}
                    >
                      {form}
                    </button>
                  );
                },
              )}
            </div>
          ) : (
            <p className="mt-12 text-center text-sm text-[#625e57]">
              No related lexical forms
              were identified.
            </p>
          )}
        </div>
      </section>

      {/* ======================================================
          LITERARY JOURNEY
      ======================================================= */}

      <section className="border-b border-[#b69b63]/10 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-[10px] tracking-[0.4em] text-[#a88d56]">
              LITERARY JOURNEY
            </div>

            <h2 className="mt-5 font-serif text-4xl text-[#e5ddcd]">
              A word moving through time
            </h2>

            <p className="mx-auto mt-5 max-w-2xl font-serif italic leading-7 text-[#706b62]">
              Corpus evidence places the word
              across different periods of
              Tamil literary usage.
            </p>
          </div>

          {eraTotals.length >
          0 ? (
            <div className="relative mx-auto mt-20 max-w-5xl">
              <div className="absolute left-0 right-0 top-3 hidden h-px bg-[#b69b63]/15 md:block" />

              <div className="grid gap-12 md:grid-cols-5">
                {eraTotals
                  .slice(0, 5)
                  .map(
                    (
                      [
                        era,
                        count,
                      ],
                      index,
                    ) => {
                      const max =
                        eraTotals[0][1];

                      const width =
                        max > 0
                          ? Math.max(
                              8,
                              (count /
                                max) *
                                100,
                            )
                          : 8;

                      return (
                        <div
                          key={era}
                          className="relative text-center"
                        >
                          <div className="relative z-10 mx-auto h-6 w-6 rounded-full border border-[#c1a45e]/50 bg-[#070b13]">
                            <div className="mx-auto mt-[7px] h-2 w-2 rounded-full bg-[#bda362]" />
                          </div>

                          <div className="mt-6 font-serif text-lg text-[#aaa08f]">
                            {humanEraName(
                              era,
                            )}
                          </div>

                          <div className="mt-3 font-serif text-2xl text-[#d1b56e]">
                            {count.toLocaleString()}
                          </div>

                          <div className="mt-1 text-[8px] tracking-[0.2em] text-[#625d55]">
                            TRACES
                          </div>

                          <div className="mx-auto mt-5 h-px w-24 bg-[#b69b63]/10">
                            <div
                              className="h-full bg-[#a88d56]/55"
                              style={{
                                width: `${width}%`,
                              }}
                            />
                          </div>

                          {index <
                            eraTotals.length -
                              1 && (
                            <div className="mt-7 text-[#544f47] md:hidden">
                              ↓
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
              </div>
            </div>
          ) : (
            <div className="mt-16 text-center font-serif italic text-[#676158]">
              Temporal distribution is not
              available for this word.
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          HISTORICAL → MODERN
      ======================================================= */}

      <section className="border-b border-[#b69b63]/10 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-[10px] tracking-[0.4em] text-[#a88d56]">
              HISTORICAL → LIVING TAMIL
            </div>

            <h2 className="mt-5 font-serif text-4xl text-[#e5ddcd]">
              From earlier traces to contemporary use
            </h2>

            <p className="mx-auto mt-5 max-w-2xl font-serif italic leading-7 text-[#706b62]">
              A separate historical-modern
              analysis connects literary
              evidence with present-day
              corpus usage.
            </p>
          </div>

          {historicalStatus ===
            'loading' && (
            <div className="mt-20 text-center">
              <div className="mx-auto h-2 w-2 animate-pulse rounded-full bg-[#bda362]" />

              <p className="mt-6 font-serif italic text-[#716b62]">
                Tracing historical and
                modern contexts…
              </p>
            </div>
          )}

          {historicalStatus ===
            'error' && (
            <div className="mt-20 text-center font-serif italic text-[#716b62]">
              Historical-modern analysis is
              currently unavailable.
            </div>
          )}

          {historicalStatus ===
            'loaded' && (
            <>
              <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 border-y border-[#b69b63]/10">
                <div className="py-8 text-center">
                  <div className="font-serif text-4xl text-[#d1b56e]">
                    {historicalCount.toLocaleString()}
                  </div>

                  <div className="mt-2 text-[8px] tracking-[0.3em] text-[#716b62]">
                    HISTORICAL TRACES
                  </div>
                </div>

                <div className="border-l border-[#b69b63]/10 py-8 text-center">
                  <div className="font-serif text-4xl text-[#d1b56e]">
                    {modernCount.toLocaleString()}
                  </div>

                  <div className="mt-2 text-[8px] tracking-[0.3em] text-[#716b62]">
                    MODERN MATCHES
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-16 grid max-w-5xl gap-14 md:grid-cols-2">
                <div>
                  <div className="mb-6 text-[9px] tracking-[0.3em] text-[#a88d56]">
                    HISTORICAL TRACES
                  </div>

                  <div className="space-y-7">
                    {historicalContexts
                      .slice(0, 3)
                      .map(
                        (
                          item,
                          index,
                        ) => {
                          const text =
                            displayValue(
                              item,
                            );

                          if (!text) {
                            return null;
                          }

                          return (
                            <blockquote
                              key={
                                index
                              }
                              className="border-l border-[#a88d56]/30 pl-5 font-serif text-sm italic leading-7 text-[#858073]"
                            >
                              {truncate(
                                text,
                                300,
                              )}
                            </blockquote>
                          );
                        },
                      )}
                  </div>
                </div>

                <div>
                  <div className="mb-6 text-[9px] tracking-[0.3em] text-[#7f948c]">
                    MODERN CORPUS
                  </div>

                  <div className="space-y-7">
                    {modernContexts
                      .slice(0, 3)
                      .map(
                        (
                          item,
                          index,
                        ) => {
                          const text =
                            displayValue(
                              item,
                            );

                          if (!text) {
                            return null;
                          }

                          return (
                            <blockquote
                              key={
                                index
                              }
                              className="border-l border-[#6e827b]/30 pl-5 font-serif text-sm italic leading-7 text-[#858073]"
                            >
                              {truncate(
                                text,
                                300,
                              )}
                            </blockquote>
                          );
                        },
                      )}
                  </div>
                </div>
              </div>

              {historicalModern?.interpretation_note && (
                <div className="mx-auto mt-16 max-w-3xl border-t border-[#b69b63]/10 pt-8 text-center">
                  <p className="font-serif text-sm italic leading-7 text-[#686259]">
                    {
                      historicalModern.interpretation_note
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ======================================================
          RESEARCH INSIGHT
      ======================================================= */}

      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[10px] tracking-[0.4em] text-[#a88d56]">
            RESEARCH INSIGHT
          </div>

          <h2 className="mt-5 font-serif text-3xl text-[#e5ddcd]">
            What the corpus reveals
          </h2>

          <div className="mx-auto mt-10 max-w-2xl border-y border-[#b69b63]/10 py-10">
            <p className="font-serif text-lg italic leading-9 text-[#918878]">
              The word{' '}
              <span className="text-[#d0b36b]">
                {normalizedWord}
              </span>{' '}
              appears across{' '}
              <span className="text-[#d0b36b]">
                {clusters.length}
              </span>{' '}
              semantic field
              {clusters.length ===
              1
                ? ''
                : 's'}
              {totalOccurrences >
              0
                ? `, with ${totalOccurrences.toLocaleString()} contextual occurrences represented in the semantic analysis.`
                : '.'}
            </p>

            {eraTotals.length >
              0 && (
              <p className="mt-6 text-[10px] tracking-[0.16em] text-[#625d55]">
                LARGEST TEMPORAL SIGNAL:{' '}
                {humanEraName(
                  eraTotals[0][0],
                ).toUpperCase()}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================
          EXPLORE ANOTHER WORD
      ======================================================= */}

      <section className="border-t border-[#b69b63]/10 px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <div className="text-[9px] tracking-[0.35em] text-[#665f54]">
            CONTINUE EXPLORING
          </div>

          <p className="mt-5 font-serif text-2xl italic text-[#777066]">
            Begin with another word.
          </p>

          <form
            className="mt-8"
            onSubmit={(event) => {
              event.preventDefault();

              const nextWord =
                searchWord.trim();

              if (!nextWord) {
                return;
              }

              navigateToWord(
                nextWord,
              );

              setSearchWord('');
            }}
          >
            <div className="flex items-center border-b border-[#a88d56]/30 pb-3">
              <input
                value={searchWord}
                onChange={(event) =>
                  setSearchWord(
                    event.target
                      .value,
                  )
                }
                placeholder="Search Tamil word…"
                className="min-w-0 flex-1 bg-transparent font-serif text-xl text-[#d8cfbe] outline-none placeholder:text-[#4e4a43]"
              />

              <button
                type="submit"
                className="ml-4 text-[#9d8555] transition hover:text-[#d2b56e]"
                aria-label="Search"
              >
                ⌕
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* WARNINGS */}

      {warnings.length >
        0 && (
        <section className="border-t border-[#b69b63]/10 px-6 py-8">
          <div className="mx-auto max-w-5xl">
            {warnings.map(
              (
                warning,
                index,
              ) => (
                <p
                  key={`${warning}-${index}`}
                  className="text-center font-mono text-[10px] leading-6 text-[#4f4b45]"
                >
                  {warning}
                </p>
              ),
            )}
          </div>
        </section>
      )}
    </main>
  );
}