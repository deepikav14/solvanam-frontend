export const API_BASE_URL = 'http://127.0.0.1:8000';

export class BackendUnavailableError extends Error {
  constructor() {
    super('Backend unavailable');
    this.name = 'BackendUnavailableError';
  }
}

// -- Raw response shapes (kept loose — the backend may extend these) --

export interface WordResponse {
  word?: string;
  [key: string]: unknown;
}

export interface FamilyResponse {
  word?: string;
  family?: unknown;
  [key: string]: unknown;
}

export interface ConstellationResponse {
  word?: string;
  constellation?: unknown;
  [key: string]: unknown;
}

// -- Fetch helper --

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
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

// -- API endpoints --

export function getHealth(signal?: AbortSignal): Promise<WordResponse> {
  return fetchJson<WordResponse>(`${API_BASE_URL}/health`, signal);
}

export function getWord(word: string, signal?: AbortSignal): Promise<WordResponse> {
  return fetchJson<WordResponse>(
    `${API_BASE_URL}/word/${encodeURIComponent(word)}`,
    signal,
  );
}

export function getWordFamily(word: string, signal?: AbortSignal): Promise<FamilyResponse> {
  return fetchJson<FamilyResponse>(
    `${API_BASE_URL}/word/${encodeURIComponent(word)}/family`,
    signal,
  );
}

export function getWordConstellation(word: string, signal?: AbortSignal): Promise<ConstellationResponse> {
  return fetchJson<ConstellationResponse>(
    `${API_BASE_URL}/word/${encodeURIComponent(word)}/constellation`,
    signal,
  );
}

// -- Response parsers (defensive — extract arrays/strings from arbitrary shapes) --

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') {
    const arr = Object.values(value).filter((v) => v !== null && v !== undefined);
    return arr.length > 0 ? arr : [];
  }
  return [];
}

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number') return String(value);
  return null;
}

export interface ParsedFamilyMember {
  text: string;
  sub?: string;
}

export function parseFamily(data: FamilyResponse): ParsedFamilyMember[] {
  const familyRaw = data.family ?? data.forms ?? data.lexical_family ?? data.morphemes;
  const items = asArray(familyRaw);
  return items
    .map((item): ParsedFamilyMember | null => {
      const s = asString(item);
      if (s) return { text: s };
      if (item && typeof item === 'object') {
        const word = asString((item as Record<string, unknown>).word) ??
          asString((item as Record<string, unknown>).form) ??
          asString((item as Record<string, unknown>).text) ??
          asString((item as Record<string, unknown>).surface);
        const gloss = asString((item as Record<string, unknown>).gloss) ??
          asString((item as Record<string, unknown>).meaning) ??
          asString((item as Record<string, unknown>).pos) ??
          asString((item as Record<string, unknown>).category);
        if (word) return { text: word, sub: gloss ?? undefined };
      }
      return null;
    })
    .filter((m): m is ParsedFamilyMember => m !== null);
}

export interface ParsedConstellationNode {
  label: string;
  weight?: number;
  sub?: string;
}

export interface ParsedConstellation {
  center: string;
  nodes: ParsedConstellationNode[];
}

export function parseConstellation(word: string, data: ConstellationResponse): ParsedConstellation {
  const center = asString(data.word) ?? word;

  const clustersRaw = data.constellation ?? data.clusters ?? data.semantic_clusters ?? data.nodes ?? data.related;
  const clusterItems = asArray(clustersRaw);

  const nodes: ParsedConstellationNode[] = clusterItems
    .map((item): ParsedConstellationNode | null => {
      const s = asString(item);
      if (s && s !== center) return { label: s };

      if (item && typeof item === 'object') {
        const label = asString((item as Record<string, unknown>).word) ??
          asString((item as Record<string, unknown>).label) ??
          asString((item as Record<string, unknown>).form) ??
          asString((item as Record<string, unknown>).term) ??
          asString((item as Record<string, unknown>).name);

        if (label && label !== center) {
          const weight = (item as Record<string, unknown>).weight ??
            (item as Record<string, unknown>).score ??
            (item as Record<string, unknown>).similarity ??
            (item as Record<string, unknown>).frequency;
          const sub = asString((item as Record<string, unknown>).gloss) ??
            asString((item as Record<string, unknown>).meaning) ??
            asString((item as Record<string, unknown>).cluster) ??
            asString((item as Record<string, unknown>).type);
          return {
            label,
            weight: typeof weight === 'number' ? weight : undefined,
            sub: sub ?? undefined,
          };
        }
      }
      return null;
    })
    .filter((n): n is ParsedConstellationNode => n !== null);

  return { center, nodes };
}

export interface WordMetadata {
  word: string;
  definitions: string[];
  pos: string | null;
  gloss: string | null;
  raw: WordResponse;
}

export function parseWordMetadata(word: string, data: WordResponse): WordMetadata {
  const definitions: string[] = [];
  const defRaw = data.definition ?? data.definitions ?? data.meaning ?? data.meanings ?? data.gloss ?? data.glosses;
  for (const item of asArray(defRaw)) {
    const s = asString(item);
    if (s) definitions.push(s);
  }

  const pos = asString(data.pos ?? data.part_of_speech ?? data.category);
  const gloss = asString(data.gloss ?? data.short_gloss ?? data.summary);

  return { word: asString(data.word) ?? word, definitions, pos, gloss, raw: data };
}
