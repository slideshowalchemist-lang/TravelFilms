// The nine regions, in the order a traveller usually moves through Egypt (north to south).
export const REGIONS = [
  { slug: 'cairo', name: 'Cairo', blurb: 'Giza, Saqqara and Dahshur, Old Cairo and the museums.' },
  { slug: 'fayoum', name: 'Fayoum', blurb: 'Lakes, waterfalls and Medinet Madi, an easy escape from Cairo.' },
  { slug: 'nile-north', name: 'North of Luxor', blurb: 'Dendera and Abydos, usually done as a long day trip from Luxor.' },
  { slug: 'luxor-east', name: 'Luxor — East Bank', blurb: 'Karnak, Luxor Temple and the Luxor Museum.' },
  { slug: 'luxor-west', name: 'Luxor — West Bank', blurb: 'The Valleys of the Kings and Queens, the nobles’ tombs and the great mortuary temples.' },
  { slug: 'nile-south', name: 'South of Luxor', blurb: 'Esna, Edfu and Kom Ombo, along the Nile between Luxor and Aswan.' },
  { slug: 'aswan', name: 'Aswan', blurb: 'Philae, the Unfinished Obelisk and the High Dam.' },
  { slug: 'lake-nasser', name: 'Lake Nasser', blurb: 'Relocated Nubian temples, reachable only by cruise.' },
  { slug: 'abu-simbel', name: 'Abu Simbel', blurb: 'Ramesses II’s colossal rock-cut temples.' },
] as const;

export type RegionSlug = (typeof REGIONS)[number]['slug'];
export const REGION_SLUGS = REGIONS.map((r) => r.slug) as [RegionSlug, ...RegionSlug[]];

export const regionBySlug = (slug: string) => REGIONS.find((r) => r.slug === slug);

export const VERDICTS = {
  unmissable: 'Unmissable',
  'worth-it': 'Worth it',
  enthusiasts: 'For enthusiasts',
  skip: 'Skip it',
} as const;
