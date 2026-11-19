# Egypt Before You Go

A cinematic travel film website showcasing destinations around the world.

Capturing special lifetime memories, one frame at a time.
## Trip pass: owner preview and scoring

While `TRIP_PASS_OPEN` is `false` (src/data/tripPassStatus.ts), every `/trip-pass` page is locked to the owners.
Sign in at `/trip-pass/sign-in`. Two Netlify environment variables are needed (Site configuration → Environment variables):

- `OWNER_PASSWORD`: the password you sign in with
- `ACCESS_SECRET`: a long random string used to sign the sign-in cookie (keep it secret; changing it signs everyone out)

To score a site, fill in `scores:` in its card (src/content/sites/*.md), 1–5 on each criterion, half points allowed:

```yaml
scores: { scale: 4, preservation: 4, colour: 1, sculpture: 2, uniqueness: 3, story: 3, access: 3 }
gettingThere: "Short boat ride from the High Dam"
tip: "Bring a torch for the inner chambers"
```

The verdict is worked out from the scores (src/lib/rubric.ts). Leave `verdict:` blank unless you want to override it,
and if you do, explain why in `verdictNote:`.
