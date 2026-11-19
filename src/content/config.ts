import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { REGION_SLUGS } from '../data/regions';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

// Trip pass: one Markdown file per site in src/content/sites/.
const score = z.number().min(1).max(5).multipleOf(0.5);
const siteCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sites' }),
  schema: z.object({
    title: z.string(),
    region: z.enum(REGION_SLUGS),
    /** Sites visited together (one ticket, one stop) share a group name, e.g. "Valley of the Kings" */
    group: z.string().optional(),
    /** Leave blank: the verdict is worked out from the scores. Set it only to override the rules (say why in verdictNote). */
    verdict: z.enum(['', 'unmissable', 'worth-it', 'enthusiasts', 'if-you-have-time']).default(''),
    verdictNote: z.string().optional(),
    /** The rubric: 1–5 on each criterion (half points allowed). Leave any out until it's agreed. */
    scores: z
      .object({
        scale: score,
        preservation: score,
        colour: score,
        sculpture: score,
        uniqueness: score,
        story: score,
        access: score,
      })
      .partial()
      .default({}),
    /** The fact line: time on site · getting there · one tip */
    gettingThere: z.string().optional(),
    tip: z.string().optional(),
    /** Free sample cards are readable without a trip pass */
    free: z.boolean().default(false),
    /** Drafts are hidden on the live site unless SHOW_DRAFTS is on (src/lib/sites.ts) */
    draft: z.boolean().default(true),
    lastVisited: z.string().default(''),
    timeNeeded: z.string().optional(),
    /** "What is it?" — shown to everyone, as the teaser above the paywall */
    summary: z.string().default(''),
    videos: z
      .array(
        z.object({
          id: z.string(),
          start: z.number().int().optional(),
          year: z.number().int().optional(),
          label: z.string().optional(),
        })
      )
      .default([]),
  }),
});

export const collections = {
  post: postCollection,
  sites: siteCollection,
};
