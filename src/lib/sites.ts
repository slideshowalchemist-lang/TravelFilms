import { getCollection, type CollectionEntry } from 'astro:content';

export type Site = CollectionEntry<'sites'>;

/**
 * While the trip pass is being written, every card is a draft. SHOW_DRAFTS = true shows them on the
 * live site too (marked "Draft") so the library isn't empty. Set it to false at launch, and from then
 * on only cards with `draft: false` appear.
 */
export const SHOW_DRAFTS = true;

export const isVisible = (site: Site) => import.meta.env.DEV || SHOW_DRAFTS || !site.data.draft;

/** Payments aren't connected yet: the buy button says "Coming soon" until CHECKOUT_URL is set. */
export const CHECKOUT_URL = '';
export const PASS_PRICE = 'AUD $49';

export async function getSites(): Promise<Site[]> {
  return (await getCollection('sites')).filter(isVisible);
}

/** Groups a region's sites for display: ungrouped sites first, then each named group. */
export function groupSites(sites: Site[]): { group: string | null; sites: Site[] }[] {
  const map = new Map<string | null, Site[]>();
  for (const s of sites) {
    const key = s.data.group ?? null;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a === null ? -1 : b === null ? 1 : 0))
    .map(([group, list]) => ({ group, sites: list.sort((a, b) => a.data.title.localeCompare(b.data.title)) }));
}

export const watchUrl = (id: string, start?: number) =>
  `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}s` : ''}`;

export const thumbUrl = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
