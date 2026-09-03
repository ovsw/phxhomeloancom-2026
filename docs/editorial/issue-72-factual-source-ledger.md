# Issue 72: editorial baseline and factual source ledger

Reviewed: 2026-08-31

Scope: [GitHub issue 72](https://github.com/ovsw/phxhomeloancom-2026/issues/72), part of [issue 71](https://github.com/ovsw/phxhomeloancom-2026/issues/71)

Systems inspected: Basecamp project `47793039`, Sanity project `hv0545v9` / dataset `development`, and the public primary sources listed below

This document is the editorial baseline for the next content pass. It reconciles the available Basecamp instructions and attachments with the current Sanity records, records the authoritative source for volatile facts, and separates verified statements from claims that need qualification or confirmation.

No Sanity record was changed and no Basecamp to-do was closed while producing this baseline.

## How to use this baseline

- **Keep** means the current direction is supported and does not need an editorial change for this issue.
- **Revise** means downstream copy should be narrowed, expanded, or corrected before publication.
- **Hold** means do not publish the claim until the named evidence is supplied.
- **Context only** means the material can inform comparisons but should not become a prominent product promise.
- Basecamp comments are authoritative for Jimmy's intended positioning and first-person process. Public agency sources and the controlled lender policy are authoritative for program rules.
- The two audit documents are advisory inputs, not factual authorities. Their numerical claims must resolve through the source ledger before reuse.

## Sanity snapshot

The target records were queried with both `published` and `raw` perspectives on 2026-08-31. The target IDs resolved to the same records in both perspectives. There were no draft variants for any target record. The unrelated drafts present in the raw dataset were `drafts.buyersGuideSpring2021`, `drafts.contactMe`, `drafts.cb08f038-de68-4dc9-bca0-61b78049549f` (`/reasons-mortgage-rejection-pre-approval/`), and `drafts.a894b20b-1977-4045-88b8-793d168942d6` (`/where-americans-are-moving`).

| Record | Current slug | Updated (UTC) | Baseline disposition |
| --- | --- | --- | --- |
| `apply` | `/apply` | 2026-08-21 08:55 | **Revise.** Only the header and CTA are present. Add preparation, sequence, timing, credit-review, rate-lock, and follow-up guidance with the qualifications below. |
| `award` | `/jimmy-vercellino-awarded-top-1-percent-mortgage-originators-in-us-2019` | 2026-08-21 08:55 | **Revise.** The legacy 2019 page is narrow and contains a typo. Preserve only evidence-backed award years and affiliations; decide the durable URL/redirect separately. |
| `c2pLoan` | `/phoenix-construction-to-permanent-loan` | 2026-08-29 08:05 | **Keep.** The page already reflects the supplied lender policy and distinguishes generic monthly construction interest from the VA interest-reserve treatment. Jimmy approved the published update. |
| `convenionalLoan` | `/phoenix-conventional-loan` | 2026-08-21 08:55 | **Keep with annual review.** The stale limits called out by the audit are no longer present. Keep limit examples year- and geography-labeled. |
| `fhaLoan` | `/phoenix-fha-loan` | 2026-08-21 08:55 | **Revise.** Home in Five is described too uniformly. Assistance, income, lien, forgiveness, rate, and availability depend on the selected product. |
| `jumboLoan` | `/phoenix-jumbo-loan` | 2026-08-21 08:55 | **Keep.** The page uses the verified 2026 baseline conforming limit of $832,750 and appropriately qualifies jumbo terms as lender-specific. |
| `vaLoan` | `/phoenix-va-loan` | 2026-08-21 08:55 | **Revise.** The full-entitlement explanation is sound, but add the remaining-entitlement path for a simultaneous VA-backed purchase and avoid implying automatic qualification. |
| `loanOptions` | `/types-of-mortgage-loans` | 2026-08-21 08:55 | **Revise selectively.** Apply the useful comparison structure from the flow document, but keep USDA contextual rather than prominent per Jimmy's instruction. |
| `mystory` | `/phoenix-loan-originator` | 2026-08-21 08:55 | **Revise.** Add only the authority and recognition facts supported below. Hold the NAR instructor wording pending documentation. |

The former down-payment-assistance slugs inspected (`/benefits-of-arizona-home-plus`, `/down-payment-assistance-programs-in-arizona`, `/home-in-five`, and `/home-plus`) were not published page records and did not have matching redirect records in the dataset. A downstream content/routing pass must decide whether any indexed legacy URL needs a redirect; this baseline does not treat removal as complete merely because the records are absent.

## Basecamp reconciliation

Later comments and supplied policy material take precedence over an earlier to-do description where they conflict.

| Basecamp input | What it contributes | Reconciliation and downstream action |
| --- | --- | --- |
| [Old Award Page](https://app.basecamp.com/6230954/buckets/47793039/todos/10225416999) | The description proposed removing or redirecting the old Goldwater-era page. Jimmy's [later direction](https://app.basecamp.com/6230954/buckets/47793039/todos/10225416999#__recording_10249046197) asks to showcase both Mortgage Executive Top 1% and Scotsman Guide veteran recognition. Supplied assets: [2026 Scotsman badge](https://app.basecamp.com/6230954/buckets/47793039/todos/10225416999#__recording_10227401759), [Top 1% badge](https://app.basecamp.com/6230954/buckets/47793039/todos/10225416999#__recording_10227587383), and [layout mockup](https://app.basecamp.com/6230954/buckets/47793039/todos/10225416999#__recording_10248038109). | **Revise, newer direction wins.** Retain both recognitions only with exact supported year/title. A badge is licensed artwork, not evidence that a particular person earned a particular category or year. Use the award evidence in the ledger and do not revive Goldwater as the current affiliation. |
| [Downpayment assistance page factual data](https://app.basecamp.com/6230954/buckets/47793039/todos/10225421495#__recording_10253147199) | Requests confirmation of old Home Plus/Home in Five numbers. Jimmy explicitly said he was unsure and suggested using actively published information. | **Revise from official sources.** Jimmy's response is not factual confirmation. Remove the unsupported military bonus and universal program terms; use product-specific wording and recheck live availability before publication. |
| [Why USDA is not featured](https://app.basecamp.com/6230954/buckets/47793039/todos/10226194733#__recording_10253138619) | Jimmy says he rarely handles USDA loans and does not want them emphasized. | **Context only.** Keep USDA out of prominent product cards and primary calls to action. It may appear in a neutral comparison when useful to the reader. |
| [Review updated C2P tier/draw information](https://app.basecamp.com/6230954/buckets/47793039/todos/10226200055) | Jimmy supplied `Luminate Bank Construction to Perm (C2P) Loan Policy 7.1 V4 11.12.25.docx` in [this comment](https://app.basecamp.com/6230954/buckets/47793039/todos/10226200055#__recording_10227670750), asked for a digestible overview, and later approved the 2026-08-29 update. | **Keep.** Treat the controlled policy as the lender-specific authority. Current copy already captures the major terms without reproducing an underwriting manual. Revalidate when the policy changes. |
| [VA C2P variant](https://app.basecamp.com/6230954/buckets/47793039/todos/10226202509#__recording_10226941216) | Jimmy asks to include the niche VA construction-to-permanent option and its guidelines. | **Keep.** It is present on the current C2P page. Continue to label it as a lender/program-specific option, not a universal VA benefit. |
| [VALoansForVets contradiction](https://app.basecamp.com/6230954/buckets/47793039/todos/10226203529#__recording_10253147707) | Jimmy states that the Veteran does not make payments during construction. | **Keep with VA qualifier.** The policy resolves the apparent conflict: generic C2P interest is billed monthly on disbursed funds, while VA C2P interest is paid from an interest reserve. Never generalize the VA treatment to every C2P borrower. |
| [VA lead destination](https://app.basecamp.com/6230954/buckets/47793039/todos/10226206711#__recording_10226948276) | Jimmy wants VA leads to remain on PHXHomeLoan.com. | **Keep.** Do not send the primary conversion path to a separate VA domain. |
| [Full SEO/content audit](https://app.basecamp.com/6230954/buckets/47793039/todos/10226218730) | Jimmy supplied `phxhomeloan_content_audit.docx` and `phxhomeloan_types_page_flow.docx` in [this comment](https://app.basecamp.com/6230954/buckets/47793039/todos/10226218730#__recording_10253144182) and asked that updates retain his voice. | **Advisory.** Use its page inventory, prioritization, and flow ideas. Do not reuse its product figures without a primary source. The audit's old conforming-limit findings are already resolved on the current Conventional, Jumbo, and VA records. |
| [Factual/legal review](https://app.basecamp.com/6230954/buckets/47793039/todos/10248017661#__recording_10253148159) | Contains byte-identical copies of the same audit and flow documents. | **No-op duplicate.** Reference the copies attached to the full audit to avoid treating duplicates as independent evidence. |
| [Build Apply Page Content](https://app.basecamp.com/6230954/buckets/47793039/todos/10226219987) | No description or comments. | **No independent requirements.** Use Jimmy's detailed Apply-page answers below plus the verified consumer sources. |
| [Make new video content](https://app.basecamp.com/6230954/buckets/47793039/todos/10226193375) | Lists missing video topics across product and process pages. | **Production backlog, not factual evidence.** Embed only supplied published videos; do not invent a Jumbo or Apply video. |
| [VA rebuild](https://app.basecamp.com/6230954/buckets/47793039/todos/10024653910#__recording_10253156344) | Jimmy supplied videos on [multiple VA loans](https://www.youtube.com/watch?v=9JiRYYYPIrQ), [VA loans start to finish](https://www.youtube.com/watch?v=Wtgxvyxmt54), and [pros and cons](https://www.youtube.com/watch?v=Zr2qwOUad2U). | **Use selectively.** The simultaneous-loan video supports voice and FAQs, but the VA source in the ledger controls entitlement facts. |
| [FHA rebuild](https://app.basecamp.com/6230954/buckets/47793039/todos/10024681267#__recording_10253157487) | Jimmy identifies down payment, minimum score, and mortgage insurance as frequent questions and supplies [an FHA video](https://www.youtube.com/watch?v=H-2VebTO_YU). | **Use.** Preserve the questions and video; verify every numeric answer against the current program source before publication. |
| [Conventional rebuild](https://app.basecamp.com/6230954/buckets/47793039/todos/10024684227#__recording_10253158265) | Jimmy plans a dedicated video and supplies an interim [FHA vs. conventional video](https://www.youtube.com/watch?v=2-5z3fhUAOA). | **Use as interim content.** Do not describe it as the promised dedicated conventional video. |
| [Jumbo rebuild](https://app.basecamp.com/6230954/buckets/47793039/todos/10024686469#__recording_10253159209) | Jimmy wants down payment, minimum credit, rates, ARM savings, definition, and qualification difficulty addressed. No current video was supplied. | **Revise copy; hold video slot.** Treat qualifications and pricing as lender/borrower-specific and wait for Jimmy's video. |
| [How Apply works](https://app.basecamp.com/6230954/buckets/47793039/todos/10024691082#__recording_10253160031) | Jimmy asks the page to cover required information, approval duration, expiration, rate lock, shopping timing, credit impact, hard versus soft pulls, and why to apply. He says his team starts with a soft pull. | **Revise with qualifications.** Describe “soft pull first” as this team's process, disclose that a later hard inquiry may occur with authorization, and do not promise an approval duration or lock outcome without Luminate's current operating guidance. |
| [C2P rebuild](https://app.basecamp.com/6230954/buckets/47793039/todos/10024707822#__recording_10253161426) | Jimmy identifies build duration, overruns, current-home sale, getting started, builder approval, and required information as key questions. | **Keep/currently addressed.** The current page covers the supplied policy's duration, contingency, builder review, draw, and qualification concepts. |
| [Authority rebuild](https://app.basecamp.com/6230954/buckets/47793039/todos/10024711252#__recording_10253160714) | Jimmy self-reports: “Certified Instructor National Association of Realtors,” founder of the School of Veterans Home Financing, and licensed instructor with the Arizona Department of Real Estate. | **Split by evidence.** ADRE independently verifies the school administrator and instructor records. “Founder” remains self-attested; the exact NAR certification/title is **Hold** until a certificate, registry entry, or NAR confirmation is supplied. |

## Audit recommendation crosswalk

The content audit describes the old public site, while the `development` dataset contains a smaller migrated set. The tables below map every finding and proposed page-flow change. “Absent” is a justified Sanity no-op for this preparatory ticket, not proof that the old URL is handled: indexed legacy URLs still need a separate routing inventory.

### Critical audit findings

| Audited path | Development record | Disposition |
| --- | --- | --- |
| `/phoenix-conventional-loan/` | `convenionalLoan` | **Verified no-op.** The stale 2021 $548,250 limit is not in the current record. Keep annual/year/geography review. |
| `/phoenix-jumbo-loan/` | `jumboLoan` | **Verified no-op.** The stale $548,250/$765,600 limits are gone; the current page uses the verified 2026 baseline. |
| `/phoenix-va-loan/` | `vaLoan` | **Revision for entitlement, no-op for stale limit.** The obsolete 2021 limit is gone. Add the remaining-entitlement explanation below. |
| `/scottsdale-jumbo-loan/` | Absent | **Sanity no-op.** Do not recreate the stale $647,200 copy; check the legacy URL during routing work. |
| `/mortgage-interest-rates/` | Post `e896ad9c-4504-4b1c-8472-610bfa38c239` | **Revise or retire.** Remove the 2021 table, “all-time low” framing, and prediction. Any live rate requires a dated authoritative feed/source. |
| `/current-refinance-and-mortgage-rates/` | Absent | **Sanity no-op.** Do not recreate the duplicate 2021 rate table; include the URL in routing work. |
| `/mortgage-amortization-calculator/` | Post `945b401a-2977-4156-acd8-57d960775118` | **Revise.** Label any worked rate as illustrative rather than representative of today's market, or use a clearly dated live input. |
| `/first-time-home-buyer-learn-how-jumbo-loans-work/` | Post `6d749b24-ae69-48b2-bcb6-7b6247752cbd` | **Revise.** Replace the 2018 limit with year/geography-aware guidance from FHFA. |
| `/home-loans-becoming-harder-to-get/` | Post `91799e22-131c-4c11-9348-b3c527103d6a` | **Revise or retire.** Remove 2020 limits and explicitly date any market/availability narrative. |
| `/how-much-mortgage-can-i-afford/` | Post `a90f97a3-7873-4057-80cd-2ecb528d501c` | **Revise.** Replace the 2021 jumbo threshold with year/geography-aware guidance. |
| `/how-to-choose-type-mortgage-loan/` | Absent | **Sanity no-op.** Do not recreate the 2018 threshold; check the legacy URL during routing work. |
| `/conventional-financing-for-your-home-purchase/` | Absent | **Sanity no-op.** Do not recreate the 2018 limits; check the legacy URL during routing work. |
| `/what-is-a-reverse-mortgage/` | Post `97e045b7-4c45-4b4e-8d45-c0624913c020` | **Revise.** Verify the current HECM limit directly with HUD before publishing a replacement; the audit's approximation is not the authority. |
| `/mortgage-rates-for-vacation-homes/` | Absent (the distinct `/vacation-home-mortgage-requirements` post remains) | **Sanity no-op for the audited URL.** Do not carry the 5%/5.5% example into the surviving post; check routing separately. |
| `/mortgage-points/` | Post `39dc5754-b47f-4b50-a4de-4cae706d87a0` | **Revise.** Make rate examples hypothetical or dated; do not present 4%/3.5% as current pricing. |
| `/factors-that-affect-phoenix-interest-rates/` | Absent | **Sanity no-op.** Do not recreate the 3% example; check the legacy URL during routing work. |
| `/why-mortgage-rates-are-rising-oil-prices-inflation/` | Post `dc73560e-5eed-43fd-a5ad-3d3a69ba4169` | **Revise or retain as dated analysis.** Remove evergreen framing and attach the original observation date/source to every market figure. |
| `/why-now-is-the-best-window-for-buyers/` | Post `7646a8e8-c88b-496a-9f30-087df67b6f90` | **Revise or retain as dated analysis.** Do not leave “best window” or May/June market data as an evergreen claim. |

### High and medium audit findings

| Audited path | Development record | Disposition |
| --- | --- | --- |
| `/phoenix-fha-loan/` | `fhaLoan` | **Revise.** Replace the isolated $105,291 assistance figure and uniform Home in Five promises with the product-specific decision below. |
| `/benefits-home-plus-mortgage-loan-program/` | Absent | **Sanity no-op.** Do not recreate the 2018 purchase/income caps; check routing separately. |
| `/down-payment-assistance-available-when-buying-home/` | Post `b7f2d13a-393c-4fba-88ba-e89392e18f11` | **Revise.** Reconfirm Home Plus and Doctor Loan availability/terms with current primary lender/program materials or remove the precise promises. |
| `/buy-house-low-no-down-payment/` | Absent | **Sanity no-op.** Do not recreate old VA/FHA fee percentages; check routing separately. |
| `/spring-2021-buyers-guide/` | Draft-only `drafts.buyersGuideSpring2021` | **Published no-op; draft follow-up.** It is not published. Rewrite as evergreen or intentionally discard the stale draft in a separate mutation task. |
| `/jimmy-vercellino-awarded-top-1-percent-mortgage-originators-in-us-2019/` | `award` | **Revise.** Use the exact evidence-backed awards and historical affiliations below. |
| `/mortgage-forbearance/` | Post `919d9d9a-1cb9-4dc0-a9ac-57d960775118` | **Revise.** Replace COVID-relief framing with current servicer/agency guidance before treating it as evergreen. |
| `/signs-you-should-refinance-your-mortgage/` | Post `dd62e815-08bc-45c3-822e-2aba395a932b` | **Revise.** Replace the low-rate-era premise with borrower-specific break-even guidance; do not assume refinancing lowers the rate. |
| `/home-appraisal-timeline-arizona/` | Post `6dcbbb48-984a-4517-a99a-9057dca4c5d8` | **Revise.** Remove the 2022 rapid-sales framing or retain it only as dated context. |
| `/obtain-lowest-mortgage-interest-rate/` | Post `e2244db9-29d4-43a0-9696-7bc3738dc6b2` | **Revise.** Remove or replace the 2019 forecast link. |
| `/how-does-a-balloon-mortgage-work/` | Post `f0540fcd-cdd0-4437-abd4-d9f2adc1007f` | **Revise.** Remove the unsupported “recently less popular” market characterization or support it with dated evidence. |
| `/the-benefits-of-an-assumable-mortgage/` | Post `ba7da99c-9673-4ad1-b2a8-1af331cea92b` | **Revise.** Replace the 2021 rising-market framing with current, conditional borrower guidance. |
| `/how-much-are-closing-costs-on-a-house/` | Post `266da9e9-a853-41be-949d-c19b35b51cb6` | **Revise.** Remove the 2022 Arizona average or replace it with a current, dated primary source and a borrower-specific qualification. |

### Low-priority and structural audit findings

| Audited path/recommendation | Development record | Disposition |
| --- | --- | --- |
| Three duplicate C2P paths | Only canonical `c2pLoan` at `/phoenix-construction-to-permanent-loan` is present | **Content no-op; routing follow-up.** The two audited duplicate records are absent. Confirm legacy redirects/canonicals separately. |
| `/phoenix-loan-officer/` | Post `7a57e132-950d-4cfe-80b5-c1569dc24d71` | **Low-priority revise/retire.** Review the 2018 byline and relationship to the authority page `mystory`. |
| `/loan-information/` | Absent | **Sanity no-op.** Check the legacy URL only if externally indexed. |
| `/renovation-loan/` | Post `559d8e1f-ef73-4829-8035-c808396a9426` | **Low-priority revise.** Reconfirm product terms before surfacing the 2018 content. |
| `/using-your-equity-to-increase-your-homes-value/` | Post `641d3483-e366-4021-b6df-a08cff651b69` | **Low-priority revise.** Keep figures explicitly illustrative and review the 2019 framing. |
| `/mortgage-loan/` | Absent | **Sanity no-op.** Do not recreate the old “today's market” wording. |
| `/facts-usda-mortgage-loan/` | Absent (the distinct `/usda-loan-information` post and `usdaLoan` page remain) | **Sanity no-op for the audited URL.** Reverify any 115%-of-AMI statement before reuse; keep USDA de-emphasized. |
| `/mortgage-documentation-requirements/` | Post `da449624-b8a3-4971-9ee7-dec69cba22ad` | **Low-priority review.** Validate the 2018 procedural guidance against current lender workflow before promoting it. |
| `/where-americans-are-moving/` | Post `a894b20b-1977-4045-88b8-793d168942d6` plus draft | **Deferred update.** Refresh when the 2026 U-Haul index is released and resolve the existing draft deliberately. |
| Fix critical items first | All critical rows above | **Mapped.** Current target-page no-ops are separated from post revisions and absent-record routing checks. |
| Set an annual limits reminder | Source ledger governance | **Adopt.** Recheck after FHFA/HUD annual announcements; January alone is too late if an announcement arrives earlier. |
| Date, rewrite, or retire older evergreen posts | All surviving post rows above | **Adopt as downstream editorial governance.** This issue records the decision but performs no Sanity mutation. |
| Consolidate C2P duplicates | `c2pLoan`; legacy records absent | **Content no-op; routing follow-up.** Keep the current canonical record and verify old URLs. |

### Types-of-mortgage-loans flow recommendations

All six recommendations map to `loanOptions` (`/types-of-mortgage-loans`).

| Flow recommendation | Disposition |
| --- | --- |
| Replace the glossary-like opener with reader-oriented framing | **Revise.** Keep Jimmy's voice during the downstream copy pass. |
| Consolidate repeated loan lists into an at-a-glance table linked to dedicated pages | **Revise with factual review.** Verify every down-payment, insurance, fee, eligibility, and qualification statement; do not paste the sample table unchanged. Keep USDA contextual rather than prominent. |
| Explain fixed, adjustable, and hybrid tradeoffs | **Revise.** Avoid assuming an ARM starts lower or that refinancing will be available later. |
| Frame loan-term choices around payment and total-interest tradeoffs | **Revise.** Treat the sample terms as available examples, not a universal product menu. |
| Add plain-language specialized-product definitions | **Revise selectively.** Verify each product's conditions; reverse-mortgage age/payment wording needs a current HUD source. |
| Tighten the three calls to action | **Revise.** This is a voice/UX edit with no factual dependency. |

## Required factual decisions

### Home in Five

**Decision: revise and narrow.** The official program site and its linked current documents do not support one universal set of terms:

- The public homepage states up to 6% assistance, a 640 minimum credit score, a 50% DTI ceiling, an eight-hour education course, and a $153,440 income figure.
- The Down Payment Assistance Guidelines effective 2026-06-10 state $157,360 for the standard program and $134,880 for the seven-year option. They describe materially different three-, seven-, ten-, and thirty-year second-lien structures, including products that are not interest-free or forgivable.
- The official lender-resources notices state that the seven-year forgivable option was fully utilized as of 2026-06-25 and that Platinum funds and its waitlist were closed as of 2026-06-09.

Because the official materials conflict on the general income number and availability changes independently, downstream copy should say that assistance can be available up to a program-specific percentage and that income limits, rates, lien/payment/forgiveness terms, eligibility, and funding availability vary by product and date. Confirm the live product with the team before quoting any borrower-specific benefit. Remove the old unsupported extra military percentage.

### Annual conforming loan limits

**Decision: verified and already corrected on the current target pages.** FHFA set the 2026 one-unit baseline conforming limit at **$832,750** and the high-cost ceiling at **$1,249,125**. The current Jumbo page uses the baseline figure and labels it 2026. Any page that cites a limit must include year, unit count, and geography; refresh it after FHFA's annual announcement. Do not restore the stale $548,250 or $765,600 figures from legacy content.

Blog posts carry year-labeled limits too, not only the loan pages: `first-time-home-buyer-learn-how-jumbo-loans-work`, `home-loans-becoming-harder-to-get`, `how-much-mortgage-can-i-afford`, and `what-is-a-reverse-mortgage` (HECM). To find every hit for the annual pass, search the dataset for the current figures ($832,750, $1,249,125) and the phrase "for 2026" across pages and posts.

### VA entitlement and simultaneous loans

**Decision: expand.** VA states that borrowers with full entitlement do not have a VA loan limit, subject to lender approval and appraisal. A borrower with entitlement already tied to another VA-backed loan may still have remaining entitlement. VA calculates the maximum guaranty using 25% of the county one-unit conforming limit minus entitlement already used; a down payment may be required if the guaranty is insufficient for the new loan.

Approved editorial direction: “Some eligible Veterans can use remaining entitlement for another VA-backed home while retaining an existing VA loan. The available guaranty depends on entitlement already used, the new property's county limit, price, appraisal, occupancy, and lender approval.” Do not say that every Veteran can always hold two VA loans or that a second purchase requires no down payment.

### C2P lender guidance

**Decision: verified lender-specific no-op.** The supplied Luminate policy supports the current page's central statements: up to 12 months of construction, one paid 90-day extension, possible requalification/refinancing after 18 months, photo-backed inspections targeted within three days, up to two draws monthly, final underwriting before modification, and product-specific qualification tiers. Generic construction interest is billed monthly on disbursed funds; VA C2P interest is paid from an interest reserve. Rates, float-downs, fees, extensions, and availability must remain qualified.

### Approval timing and validity

**Decision: qualify; obtain lender confirmation for a precise promise.** CFPB calls preapproval tentative rather than a guaranteed loan offer and says letters commonly carry a 30–60 day expiration. Lenders use the terms and processes differently. CFPB separately requires a Loan Estimate within three business days after receipt of the six application data points, but that disclosure deadline is not an approval-time promise.

Approved editorial direction: say the team will explain what is needed, identify missing documentation, and communicate the date printed on any preapproval. Do not promise same-day approval, a fixed turnaround, or a universal validity period. If the page needs Luminate's typical response time or validity window, Jimmy/Luminate must confirm the current workflow in writing.

### Credit review

**Decision: qualify Jimmy's stated process.** CFPB says mortgage applications and preapprovals commonly involve hard inquiries and lenders may check credit again before closing. Jimmy says his team begins with a soft pull. The page may state that team-specific first step, followed immediately by: “A hard credit inquiry may be required later with your authorization as the application or preapproval proceeds.” Do not promise that applying never affects credit.

### Rate lock

**Decision: explain, do not promise.** CFPB says a lock protects the stated rate only for the lock period and while the application remains unchanged; lock periods, extensions, fees, and float-down treatment vary. The Luminate C2P policy has its own product-specific timing and possible float-down terms and must not be generalized to other mortgages.

Approved editorial direction: explain that a rate is not locked merely by starting an application, the team will identify when a lock is available, and the borrower should confirm the expiration date, extension terms, costs, and whether lower market rates can be captured. Never promise a free extension, automatic float-down, or closing before expiration.

### Authority and awards

**Decision: publish exact, dated recognition only.** The Arizona Department of Real Estate verifies School of Veterans Home Financing school record `S08-0029`, administrator James Vercellino, and instructor record `I08-0151`, with the public record showing expiration 2028-07-31 when reviewed. An official Scotsman Guide ranking supports **2022 Top Veteran Originator, rank 49**, under the affiliation shown in that historical ranking. The Mastermind Summit/Mortgage Executive Top 1% directory supports **Top 1% Mortgage Originator for 2025** with Luminate Bank.

Do not infer that the generic supplied 2026 Scotsman Guide badge proves Jimmy personally received a 2026 veteran-category award. The Luminate announcement says 51 Luminate loan officers were 2026 Top Originators but does not identify Jimmy in the public page text reviewed. Use the documented 2022 veteran ranking unless Jimmy supplies a person-specific 2026 ranking. “Founder” of the school may be attributed to Jimmy pending stronger evidence; the exact “Certified Instructor, National Association of REALTORS®” claim remains on hold.

## Factual source ledger

Every volatile numerical or eligibility claim should carry an “as of” date in working copy, even if that date is omitted from the final prose for readability.

| Topic | Authoritative source/material | Supported use | Source date/effective date | Reviewed | Recheck trigger |
| --- | --- | --- | --- | --- | --- |
| 2026 conforming limits | [FHFA: 2026 conforming loan limit values](https://www.fhfa.gov/news/news-release/fhfa-announces-conforming-loan-limit-values-for-2026) | $832,750 one-unit baseline; $1,249,125 high-cost ceiling | Announced 2025-11-25 for 2026 | 2026-08-31 | FHFA's next annual announcement or a geography/unit-count change |
| VA loan limits and partial entitlement | [VA: loan limits](https://www.va.gov/housing-assistance/home-loans/loan-limits/) and [VA: eligibility](https://www.va.gov/housing-assistance/home-loans/eligibility/) | No VA limit with full entitlement; remaining-entitlement formula and possibility of another VA-backed loan | VA page updated 2025-08-12; current when reviewed | 2026-08-31 | Annual FHFA limit change or VA guidance change |
| Home in Five overview | [Home in Five program site](https://homein5advantage.com/) | Geography, education, headline assistance, general qualification orientation | Live page; no reliable effective date displayed | 2026-08-31 | Before every publication containing a number |
| Home in Five availability | [Home in Five lender resources and notices](https://homein5advantage.com/resources-for-lenders/) | Live exhaustion/waitlist notices and links to current matrices | Notices through 2026-06-25 | 2026-08-31 | Immediately before publication and at least monthly while mentioned |
| Home in Five product terms | [Down Payment Assistance Guidelines, effective 2026-06-10](https://homein5advantage.com/uploads/Down_Payment_Assistance_Guidelines_Effective_6.10.2026.pdf), [Government matrix](https://homein5advantage.com/uploads/Home_Five_Government_V26.1.pdf), and [Conventional matrix](https://homein5advantage.com/uploads/Home_Five_Conventional_V26.2.pdf) | Product-specific income, assistance, lien, repayment/forgiveness, score, DTI, and lock terms | 2026-06-10; matrix versions displayed as V26.1/V26.2 | 2026-08-31 | Any new matrix/guideline version; reconcile the site's conflicting income figures |
| Luminate C2P | `Luminate Bank Construction to Perm (C2P) Loan Policy 7.1 V4 11.12.25.docx`, attached in [Basecamp](https://app.basecamp.com/6230954/buckets/47793039/todos/10226200055#__recording_10227670750) | Lender-specific C2P products, terms, draws, rates, extensions, and VA interest reserve | Revised 2025-11-12; approval date shown as 2025-06-01 | 2026-08-31 | Any policy revision or before adding a new numerical promise |
| Preapproval meaning/validity | [CFPB: get a preapproval letter](https://www.consumerfinance.gov/owning-a-home/explore/get-a-preapproval-letter/) | Tentative status, lender variation, commonly dated 30–60 days | Modified 2024-12-12 | 2026-08-31 | CFPB update or Luminate process change |
| Application disclosure timing | [CFPB: what it takes to apply](https://www.consumerfinance.gov/ask-cfpb/what-do-i-have-to-do-to-apply-for-a-mortgage-loan-en-144/) | Six application data points and three-business-day Loan Estimate rule; not an approval promise | Modified 2024-09-13 | 2026-08-31 | CFPB/regulatory update |
| Credit review | [CFPB: when a lender checks credit](https://www.consumerfinance.gov/ask-cfpb/when-will-a-lender-run-a-credit-check-or-obtain-a-copy-of-my-credit-report-en-322/) | Hard inquiry may occur for mortgage application/preapproval and another check may occur before closing | Reviewed 2024-12-31 | 2026-08-31 | CFPB update or Luminate process change |
| Rate locks | [CFPB: what is a rate lock?](https://www.consumerfinance.gov/ask-cfpb/whats-a-lock-in-or-a-rate-lock-en-143/) and [CFPB: choose a loan offer](https://www.consumerfinance.gov/owning-a-home/compare/choose-loan-offer/) | Lock duration/conditions, expiration, extensions, and questions to ask | Reviewed/modified 2023-05-02 and current page | 2026-08-31 | CFPB update or lender/product policy change |
| ADRE school/instructor authority | [Arizona Department of Real Estate: School of Veterans Home Financing](https://services.azre.gov/PdbWeb/School/ViewSchool/377) | School, administrator James Vercellino, instructor record, and displayed expirations | Public record showed expiration 2028-07-31 | 2026-08-31 | Before publication after expiration or any credential wording change |
| 2022 Scotsman recognition | [Scotsman Guide: 2022 Top Veteran Originators](https://www.scotsmanguide.com/rankingsdraft/top-originators-3/2022-top-veteran-originators/) | Jimmy Vercellino, rank 49, exact historical category/year/affiliation | 2022 ranking | 2026-08-31 | Only if replacing with a newer person-specific official ranking |
| 2025 Mortgage Executive recognition | [Top 1% Mortgage Originators 2025 directory](https://www.mastermindsummit.com/top-one-percent-2025) | James Vercellino and Luminate Bank in the 2025 Top 1% directory | 2025 directory | 2026-08-31 | Annually or when the directory changes |
| 2019 historical recognition | [2019 Goldwater announcement](https://www.24-7pressrelease.com/press-release/473972/goldwater-bank-recognized-by-mortgage-executive) | Historical 2019 recognition only | Published 2020-06-18 about 2019 production | 2026-08-31 | Do not use as current affiliation or current award |
| 2026 Luminate/Scotsman announcement | [Luminate: Scotsman Guide Top Originators 2026](https://www.luminate.bank/scotsman-guide-originators-2026) | Luminate-level statement that 51 officers were recognized; supplied badge usage context | 2026 announcement | 2026-08-31 | Obtain a person-specific official ranking before attributing 2026 recognition to Jimmy |
| Editorial audit and page flow | `phxhomeloan_content_audit.docx` and `phxhomeloan_types_page_flow.docx`, attached in [Basecamp](https://app.basecamp.com/6230954/buckets/47793039/todos/10226218730#__recording_10253144182) | Page inventory, prioritization, proposed information architecture, and editorial prompts only | Dated 2026-08-28 | 2026-08-31 | Never use alone to substantiate a product fact |

## Claims to remove, qualify, or confirm

| Claim | Disposition | Required replacement or evidence |
| --- | --- | --- |
| Home in Five has one income cap, one forgiveness term, or one interest treatment | **Remove** | Describe product-specific terms and live availability; consult the current guideline/matrix. |
| Home in Five always has funds available | **Remove** | State that assistance is subject to program and funding availability. |
| Military borrowers universally receive an extra 1% of assistance | **Hold** | Current official product matrix or written program confirmation. |
| All Home in Five assistance is forgiven in three/five/seven years | **Remove** | Identify the selected second-lien product; some current products amortize or do not forgive principal until maturity. |
| A Veteran can always have two VA loans with no down payment | **Remove** | Use remaining-entitlement, county-limit, price/appraisal, occupancy, and lender-approval qualification. |
| VA borrowers make construction-period payments under the current Luminate VA C2P product | **Remove** | State that this lender policy funds VA construction interest through an interest reserve; keep it product-specific. |
| Every C2P borrower avoids construction-period interest payments | **Remove** | Generic policy bills interest monthly on disbursed funds; only the documented VA treatment differs. |
| Applying never affects credit | **Remove** | State soft-pull-first as team process and disclose possible later hard inquiry with authorization. |
| Approval is guaranteed within a fixed time or stays valid for a universal period | **Remove** | Say timing depends on documentation, review, and lender process; use the date on the actual letter. |
| Starting an application locks a rate | **Remove** | Explain that lock availability, duration, cost, extension, and float-down terms must be confirmed. |
| Jimmy is a 2026 Scotsman Guide Top Veteran Originator | **Hold** | Person-specific official 2026 ranking or written Scotsman/Luminate verification of category and year. |
| Jimmy is a “Certified Instructor, National Association of REALTORS®” | **Hold** | Certificate, official registry, or written NAR confirmation with exact title and current status. |
| Jimmy founded the School of Veterans Home Financing | **Attribute/confirm** | It may be presented as Jimmy's account; obtain formation or school documentation for an unqualified institutional claim. ADRE independently supports “administrator,” not “founder.” |
| Goldwater Bank is Jimmy's current company | **Remove** | Use Luminate Bank for current copy; retain Goldwater only inside accurately dated historical award context. |

## Downstream editorial checklist

1. Expand `/apply` using the approved approval, credit, and rate-lock language; obtain written Luminate confirmation before adding a precise turnaround or preapproval-validity promise.
2. Narrow Home in Five copy on `/phoenix-fha-loan` and any shared loan-options content. Recheck the live resources page on the publication day.
3. Add the remaining-entitlement explanation and simultaneous-loan FAQ to `/phoenix-va-loan`, using the VA source rather than relying on video wording alone.
4. Preserve the current `/phoenix-construction-to-permanent-loan` distinctions. Re-review if a newer Luminate policy replaces the 2025-11-12 document.
5. Keep the verified 2026 conforming limit year/geography-labeled on Conventional and Jumbo pages and refresh it after FHFA's next announcement.
6. Rebuild the authority/award material around the verified ADRE record, 2022 Scotsman veteran ranking, and 2025 Top 1% directory. Hold the NAR and person-specific 2026 Scotsman claims.
7. Keep USDA contextual in `/types-of-mortgage-loans`; do not elevate it to a primary product or CTA.
8. Inventory externally indexed legacy DPA and award URLs, then create deliberate redirects in a separate Sanity mutation task if needed.
9. Use the supplied VA, FHA, and interim Conventional videos. Leave Jumbo and Apply video slots unclaimed until Jimmy supplies the promised recordings.

## Reproduction notes

Sanity inspection was read-only. The target snapshot used `_id`, `_type`, `_updatedAt`, and `slug.current` for the nine records listed above, checked both `published` and `raw` perspectives, searched for `drafts.<target-id>`, and queried active/inactive redirects for the inspected legacy DPA and award paths. Basecamp work was also read-only: the relevant to-dos, comments, and attachments were inspected without changing completion state or posting replies.

The three DOCX inputs were downloaded from their Basecamp attachments. All 30 pages of the C2P policy, all four pages of the content audit, and both pages of the page-flow document were rendered and visually reviewed in addition to text extraction. No layout loss that would change the interpretation of the source was observed.
