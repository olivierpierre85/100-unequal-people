# doc/

`belgium_100_synthetic_profiles.csv` is an early draft from before the
generator existed. Its income column is **gross annual household income**,
not the net monthly per-adult income the site uses, so it is not comparable
with anything in `src/data/` and nothing reads it.

The 100 profiles that the site shows are produced by
`node scripts/generate-profiles.mjs`, which documents every anchor value and
source. Regenerate from there, never from this CSV.
