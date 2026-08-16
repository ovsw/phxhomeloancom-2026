# SEO title system

Sanity stores page-specific titles. The frontend owns the public brand suffix.

## Editorial rule

- Leave **SEO title override** empty when the content title is suitable.
- When an override is needed, write only the page-specific title.
- Never add `| PHX Home Loan` or another brand phrase manually.
- Studio previews the final title and warns about manual suffixes, repeated key terms, and unusually long results. Warnings do not block publishing.

## Runtime rule

- Interior pages render `<page title> | PHX Home Loan` through the root metadata template.
- `/` uses an absolute title so the suffix cannot be applied twice.
- Blog and category pagination is derived automatically, for example `Mortgage Rates - Page 2 | PHX Home Loan`.
- Open Graph and Twitter titles use the same final title.
- Missing overrides fall back to the document title.
- `shared/seo-title.ts` temporarily removes recognized legacy suffixes at runtime.

## Content cleanup

Dataset changes are separate from code deployment. Before any cleanup:

1. Produce a read-only report of current and proposed titles:

   ```bash
   pnpm --silent audit:seo-titles --dataset=development --format=csv \
     > /tmp/phx-seo-title-audit.csv
   ```

   The command reads published documents only. Use `--dataset=production`
   explicitly when that is the intended audit target.

2. Review keyword-heavy titles manually.
3. Get explicit approval for the Sanity mutation.
4. Patch with revision guards and audit the result.
5. Remove legacy runtime cleanup only after the dataset is clean.
