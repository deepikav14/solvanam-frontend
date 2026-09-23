export const API_BASE_URL = 'http://127.0.0.1:8000';

export class BackendUnavailableError extends Error {
  constructor() {
    super('Backend unavailable');
    this.name = 'BackendUnavailableError';
  }
}

// ============================================================
// RAW RESPONSE SHAPES
// ============================================================

export interface WordResponse {
  word?: string;
  [key: string]: unknown;
}

export interface FamilyResponse {
  word?: string;
  family?: unknown;
  forms?: unknown;
  lexical_family?: unknown;
  [key: string]: unknown;
}

export interface ConstellationResponse {
  word?: string;
  constellation?: unknown;
  clusters?: unknown;
  assignments?: unknown;
  era_by_cluster_counts?: unknown;
  [key: string]: unknown;
}

export interface HistoricalModernResponse {
  status?: string;
  query?: string;
  historical_context_count?: number;
  historical_contexts?: unknown;
  modern_context_matches?: unknown;
  modern_candidates?: unknown;
  interpretation_note?: string;
  [key: string]: unknown;
}

// ============================================================
// FETCH HELPER
// ============================================================

async function fetchJson<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(url, {
      signal,
      headers: {
        Accept: 'application/json',
      },
    });
  } catch {
    throw new BackendUnavailableError();
  }

  if (!res.ok) {
    throw new BackendUnavailableError();
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new BackendUnavailableError();
  }
}

// ============================================================
// API ENDPOINTS
// ============================================================

export function getHealth(
  signal?: AbortSignal,
): Promise<WordResponse> {
  return fetchJson<WordResponse>(
    `${API_BASE_URL}/health`,
    signal,
  );
}

export function getWord(
  word: string,
  signal?: AbortSignal,
): Promise<WordResponse> {
  return fetchJson<WordResponse>(
    `${API_BASE_URL}/word/${encodeURIComponent(word)}`,
    signal,
  );
}

export function getWordFamily(
  word: string,
  signal?: AbortSignal,
): Promise<FamilyResponse> {
  return fetchJson<FamilyResponse>(
    `${API_BASE_URL}/word/${encodeURIComponent(word)}/family`,
    signal,
  );
}

export function getWordConstellation(
  word: string,
  signal?: AbortSignal,
): Promise<ConstellationResponse> {
  return fetchJson<ConstellationResponse>(
    `${API_BASE_URL}/word/${encodeURIComponent(word)}/constellation`,
    signal,
  );
}

export function getHistoricalModern(
  word: string,
  signal?: AbortSignal,
): Promise<HistoricalModernResponse> {
  return fetchJson<HistoricalModernResponse>(
    `${API_BASE_URL}/word/${encodeURIComponent(word)}/historical-modern`,
    signal,
  );
}

// ============================================================
// GENERIC PARSERS
// ============================================================

function asRecord(
  value: unknown,
): Record<string, unknown> | null {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return null;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value === null ||
    value === undefined
  ) {
    return [];
  }

  if (typeof value === 'string') {
    return [value];
  }

  return [];
}

function asString(
  value: unknown,
): string | null {
  if (
    typeof value === 'string' &&
    value.trim()
  ) {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return null;
}

function asNumber(
  value: unknown,
): number | undefined {
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

  return undefined;
}

// ============================================================
// LEXICAL FAMILY
// ============================================================

export interface ParsedFamilyMember {
  text: string;
  sub?: string;
}

/**
 * Backend structure:
 *
 * lexical_family: {
 *   forms: [
 *     { text: "அன்பு" },
 *     ...
 *   ],
 *   count: 15,
 *   source: "lexical_family.get_lexical_family"
 * }
 *
 * Only `forms` are lexical words.
 *
 * We deliberately do NOT convert the lexical_family
 * object itself into an array because that would expose:
 *
 * 15
 * lexical_family.get_lexical_family
 *
 * as fake lexical forms.
 */
export function parseFamily(
  data: FamilyResponse,
): ParsedFamilyMember[] {
  const lexicalFamily = asRecord(
    data.lexical_family,
  );

  let familyRaw: unknown;

  // ----------------------------------------------------------
  // Main /word/{word} response
  // ----------------------------------------------------------

  if (lexicalFamily) {
    familyRaw =
      lexicalFamily.forms ??
      lexicalFamily.words ??
      lexicalFamily.family;
  }

  // ----------------------------------------------------------
  // /family endpoint variants
  // ----------------------------------------------------------

  if (familyRaw === undefined) {
    const familyObject = asRecord(
      data.family,
    );

    if (familyObject) {
      familyRaw =
        familyObject.forms ??
        familyObject.words ??
        familyObject.family;
    } else {
      familyRaw = data.family;
    }
  }

  // ----------------------------------------------------------
  // Simple forms response
  // ----------------------------------------------------------

  if (familyRaw === undefined) {
    familyRaw = data.forms;
  }

  const items = asArray(familyRaw);

  return items
    .map(
      (
        item,
      ): ParsedFamilyMember | null => {
        const directText =
          asString(item);

        if (directText) {
          return {
            text: directText,
          };
        }

        const record = asRecord(item);

        if (!record) {
          return null;
        }

        const text =
          asString(record.text) ??
          asString(record.word) ??
          asString(record.form) ??
          asString(record.surface);

        if (!text) {
          return null;
        }

        const sub =
          asString(record.gloss) ??
          asString(record.meaning) ??
          asString(record.pos) ??
          asString(record.category);

        return {
          text,
          sub: sub ?? undefined,
        };
      },
    )
    .filter(
      (
        item,
      ): item is ParsedFamilyMember =>
        item !== null,
    );
}

// ============================================================
// SEMANTIC CONSTELLATION
// ============================================================

export interface ParsedConstellationNode {
  label: string;
  weight?: number;
  sub?: string;
}

export interface ParsedConstellation {
  center: string;
  nodes: ParsedConstellationNode[];
}

/**
 * Compatibility parser for older components.
 *
 * WordExplorer currently reads the richer top-level
 * `clusters` structure directly.
 */
export function parseConstellation(
  word: string,
  data: ConstellationResponse,
): ParsedConstellation {
  const center =
    asString(data.word) ??
    word;

  const clustersRaw =
    data.clusters ??
    data.constellation ??
    data.nodes ??
    data.semantic_clusters ??
    data.related;

  const clusterItems =
    asArray(clustersRaw);

  const nodes: ParsedConstellationNode[] =
    clusterItems
      .map(
        (
          item,
        ): ParsedConstellationNode | null => {
          const stringValue =
            asString(item);

          if (
            stringValue &&
            stringValue !== center
          ) {
            return {
              label: stringValue,
            };
          }

          const record =
            asRecord(item);

          if (!record) {
            return null;
          }

          const label =
            asString(record.word) ??
            asString(record.label) ??
            asString(record.form) ??
            asString(record.term) ??
            asString(record.name) ??
            asString(record.cluster_id);

          if (
            !label ||
            label === center
          ) {
            return null;
          }

          const weight =
            asNumber(record.weight) ??
            asNumber(record.score) ??
            asNumber(record.similarity) ??
            asNumber(record.frequency) ??
            asNumber(record.share) ??
            asNumber(record.size);

          const sub =
            asString(record.gloss) ??
            asString(record.meaning) ??
            asString(record.cluster_kind) ??
            asString(record.type);

          return {
            label,
            weight,
            sub: sub ?? undefined,
          };
        },
      )
      .filter(
        (
          node,
        ): node is ParsedConstellationNode =>
          node !== null,
      );

  return {
    center,
    nodes,
  };
}

// ============================================================
// WORD METADATA
// ============================================================

export interface WordMetadata {
  word: string;
  definitions: string[];
  pos: string | null;
  gloss: string | null;
  raw: WordResponse;
}

export function parseWordMetadata(
  word: string,
  data: WordResponse,
): WordMetadata {
  const definitions: string[] = [];

  const defRaw =
    data.definition ??
    data.definitions ??
    data.meaning ??
    data.meanings ??
    data.gloss ??
    data.glosses;

  for (const item of asArray(defRaw)) {
    const stringValue =
      asString(item);

    if (stringValue) {
      definitions.push(
        stringValue,
      );
    }
  }

  const pos =
    asString(
      data.pos ??
        data.part_of_speech ??
        data.category,
    );

  const gloss =
    asString(
      data.gloss ??
        data.short_gloss ??
        data.summary,
    );

  return {
    word:
      asString(data.word) ??
      word,

    definitions,

    pos,

    gloss,

    raw: data,
  };
}

// ============================================================
// DISPLAY HELPERS
// ============================================================

/**
 * Extracts useful human-readable text
 * from backend objects.
 *
 * Examples:
 *
 * { text: "அன்பு" }
 * { word: "அன்பு" }
 * { label: "அன்பு" }
 * { form: "அன்பு" }
 */
export function displayValue(
  value: unknown,
): string {
  if (
    typeof value === 'string'
  ) {
    return value.trim();
  }

  if (
    typeof value === 'number'
  ) {
    return String(value);
  }

  const record =
    asRecord(value);

  if (!record) {
    return '';
  }

  return (
    asString(record.text) ??
    asString(record.word) ??
    asString(record.label) ??
    asString(record.form) ??
    asString(record.term) ??
    asString(record.name) ??
    ''
  );
}

/**
 * Safely converts backend values
 * into displayable strings.
 */
export function cleanList(
  value: unknown,
): string[] {
  return asArray(value)
    .map(displayValue)
    .filter(Boolean);
}
