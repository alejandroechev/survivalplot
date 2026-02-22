# SurvivalPlot — Business Plan

## Product Summary

**SurvivalPlot** is a free, browser-based Kaplan-Meier survival analysis tool that replaces expensive desktop software (GraphPad Prism, SPSS, SAS) for clinical researchers, biostatisticians, and epidemiologists. Instant KM curves with confidence intervals, log-rank tests, and publication-quality at-risk tables — no install, no license fees.

**Deployed at:** survivalplot.app (Vercel free tier)

---

## Current State

| Metric | Value |
|--------|-------|
| Engine tests | 39 unit tests |
| E2E tests | 27 tests |
| Total tests | 66 |
| Core capabilities | KM estimator, log-rank test, Greenwood CI, median survival, at-risk table |

### Market Validation Scores

| Question | Score |
|----------|-------|
| Would professionals use this? | 70% |
| Does it scale to premium? | 45% |
| Is the free tier genuinely useful? | 80% |
| Would users pay for incremental premium? | 55% |
| Would users pay for major premium? | 70% |

---

## Competitive Landscape

| Competitor | Price | Strengths | Weaknesses |
|-----------|-------|-----------|------------|
| R survival package | Free | Gold standard, Cox regression, competing risks, unlimited flexibility | Steep learning curve, CLI-only, no GUI, requires R knowledge |
| SPSS | ~$1,300/yr | Institutional trust, full statistical suite, point-and-click | Expensive, bloated for survival-only work, slow updates |
| GraphPad Prism | $300–1,200/yr | Beautiful charts, easy UX, well-documented | Limited survival features, no Cox regression, expensive for students |
| SAS | ~$8,000/yr | Enterprise-grade, regulatory acceptance, comprehensive | Extremely expensive, archaic interface, steep learning curve |
| **SurvivalPlot** | **Free** | **Instant KM curves, CI bands, at-risk table, beautiful charts, zero install** | **Two-group only, no Cox regression, no competing risks, no sample size calc** |

### Competitive Advantage

1. **Zero friction** — paste data, get KM curves instantly. No install, no login, no license.
2. **Publication quality** — CI bands, at-risk tables, and clean SVG export meet journal requirements out of the box.
3. **Free forever (core)** — the free tier covers 80% of survival analysis workflows in academic research.
4. **Browser-native** — works on any device, data never leaves the browser (privacy-first).

---

## SWOT Analysis

| | Helpful | Harmful |
|---|---------|---------|
| **Internal** | Instant KM curves, CI bands, at-risk table, beautiful charts, zero-dependency engine, strong test coverage (66 tests) | Two-group only, no Cox regression, no competing risks, no sample size calculator |
| **External** | Researchers frustrated with R complexity and Prism costs; growing demand for open-access tools; journal mandates for at-risk tables | R survival package is free and comprehensive; institutional inertia (SPSS/SAS site licenses); regulatory requirements may mandate validated software |

---

## Monetization Strategy

### Phase 1 — Free Tier (Current)

**Price:** Free forever
**Target:** Graduate students, postdocs, clinical researchers doing basic survival analysis.

| Feature | Status |
|---------|--------|
| Kaplan-Meier survival curves (two groups) | ✅ Shipped |
| 95% CI bands (Greenwood's formula) | ✅ Shipped |
| Log-rank test with p-value | ✅ Shipped |
| Median survival with 95% CI | ✅ Shipped |
| At-risk table (journal-standard) | ✅ Shipped |
| CSV data import / paste | ✅ Shipped |
| PNG/SVG chart export | ✅ Shipped |
| Light/dark theme | ✅ Shipped |

**Goal:** Build user base, establish credibility, collect feedback. Target 500 MAU within 6 months.

---

### Phase 2 — Pro Tier ($99–199/yr)

**Target:** Biostatisticians, clinical trial teams, pharma researchers needing multi-group analysis and publication workflows.

| Feature | Effort | Description |
|---------|--------|-------------|
| Multi-arm comparison | M | ≥3 group KM curves with pairwise log-rank tests and Bonferroni/Holm correction |
| Cox proportional hazards | L | Semi-parametric regression with hazard ratios, Schoenfeld residuals, PH assumption test |
| Publication-quality PDF export | M | Formatted report with KM plot, at-risk table, statistics summary, ready for journal submission |
| SPSS/SAS data import | M | Read .sav (SPSS) and .sas7bdat (SAS) files directly in browser; map survival variables automatically |

**Effort key:** S = days, M = 1–2 weeks, L = 2–4 weeks, XL = 4–8 weeks

**Revenue target:** 200 paying users × $149 avg = ~$30K ARR

---

### Phase 3 — Enterprise Tier ($299–499/yr)

**Target:** CROs, pharma biostatistics departments, academic medical centers running complex survival studies.

| Feature | Effort | Description |
|---------|--------|-------------|
| Competing risks analysis | L | Fine-Gray subdistribution hazard model; cumulative incidence functions |
| Power / sample size calculator | L | Event-driven sample size for log-rank test; accrual and follow-up period modeling |
| Forest plots | M | Meta-analysis style forest plots for subgroup hazard ratios with heterogeneity statistics |
| Time-varying covariates | XL | Extended Cox model with time-dependent coefficients; counting process data format |
| Landmark analysis | L | Conditional survival from landmark time points; avoid immortal time bias |

**Revenue target:** 100 enterprise users × $399 avg = ~$40K ARR

---

## Development Roadmap

```
Phase 1 (Current)          Phase 2 (Pro)              Phase 3 (Enterprise)
─────────────────          ─────────────              ────────────────────
✅ KM estimator            Multi-arm comparison       Competing risks
✅ Greenwood CI            Cox proportional hazards   Power/sample size calc
✅ Log-rank test           PDF export                 Forest plots
✅ Median survival         SPSS/SAS import            Time-varying covariates
✅ At-risk table                                      Landmark analysis
✅ CSV import/export
✅ PNG/SVG export
```

### Priority Order (Phase 2)

1. **Cox proportional hazards** — most requested feature gap vs R; unlocks regression-based survival analysis
2. **Multi-arm comparison** — removes the two-group limitation; critical for clinical trials with multiple arms
3. **Publication-quality PDF export** — reduces manual formatting work; high perceived value
4. **SPSS/SAS data import** — removes migration friction; captures users locked into legacy formats

### Priority Order (Phase 3)

1. **Competing risks** — differentiator vs GraphPad; essential for oncology and cardiology research
2. **Power/sample size calculator** — required for grant applications and trial design; standalone value
3. **Forest plots** — visual appeal; complements Cox regression output for publications
4. **Landmark analysis** — niche but high-value for oncology trials
5. **Time-varying covariates** — most complex feature; targets advanced biostatistics users

---

## Validation Strategy

| Source | Purpose |
|--------|---------|
| Bland & Altman "Survival Analysis" worked examples | KM estimator, CI, median survival reference values |
| R survival package output | Cross-validation of all engine calculations (gold standard) |
| Published clinical trial data | Real-world KM curves with known statistics |
| Collett "Modelling Survival Data" | Cox regression and competing risks validation (Phase 2–3) |

### Validation Process

1. Implement algorithm in `packages/engine/`
2. Write test cases from published worked examples (exact numeric match)
3. Cross-validate against R `survival::survfit()` and `survival::coxph()` output
4. Document discrepancies and resolution in test comments

---

## Target Users

| Segment | Need | Current Tool | Pain Point |
|---------|------|-------------|------------|
| Graduate students | KM curves for thesis | R (forced by advisor) | Steep learning curve, time spent on code instead of research |
| Clinical researchers | Survival analysis for papers | GraphPad Prism ($300+/yr) | Cost barrier, limited survival features |
| Biostatisticians | Multi-arm trials, Cox regression | SAS ($8K/yr) | Employer pays but tool is archaic; want modern alternative for quick analyses |
| Epidemiologists | Population-level survival studies | SPSS ($1.3K/yr) | Expensive for freelance/academic use; limited export options |
| Pharma/CRO teams | Regulatory submissions | SAS + R | Need validated outputs; want faster exploratory analysis before formal runs |

---

## Key Metrics

| Metric | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|--------|---------------|---------------|---------------|
| MAU | 500 | 2,000 | 5,000 |
| Paying users | — | 200 | 300 |
| ARR | $0 | ~$30K | ~$70K |
| Test coverage | 90%+ | 90%+ | 90%+ |
| NPS | 40+ | 50+ | 50+ |

---

## Technical Architecture

```
packages/
├── engine/          # Pure TypeScript, zero dependencies
│   ├── estimator    # KM product-limit estimator
│   ├── logrank      # Log-rank chi-square test
│   ├── greenwood    # Variance + confidence intervals
│   ├── atrisk       # At-risk table generation
│   ├── cox          # (Phase 2) Cox PH regression
│   └── competing    # (Phase 3) Fine-Gray model
├── web/             # React + Vite + Recharts
│   ├── KMChart      # Step-function plot with CI bands
│   ├── AtRiskTable  # Aligned number-at-risk display
│   ├── DataEntry    # Paste/upload CSV interface
│   └── ResultsPanel # Statistics summary
└── cli/             # Node batch runner
```

All domain logic lives in `engine/` with zero DOM dependencies. Every UI feature has CLI parity for automated testing.

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| R survival package is free and comprehensive | High | Medium | Compete on UX, not features; target users who don't want to code |
| Regulatory requirements mandate validated desktop software | Medium | High | Position as exploratory/publication tool, not regulatory submission |
| Low conversion from free to paid | Medium | High | Ensure Phase 2 features solve real pain points; validate with user interviews before building |
| Cox regression implementation complexity | Low | Medium | Follow Breslow method; validate exhaustively against R; budget 4 weeks |
| Competing risks model accuracy | Medium | Medium | Use Fine-Gray subdistribution hazard; validate against R `cmprsk` package |
