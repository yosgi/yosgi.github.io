# Article content review — 2026-10-29

## Scope and verification

- Scanned the metadata and Markdown structure of 197 source documents, including drafts and non-post pages. Reviewed the recent engineering series and the damaged algorithm examples in detail.
- The initial code scan included 611 JavaScript or unlabeled blocks. A parser rejection is a review candidate, not proof of a bug: signatures, output transcripts, JSX and module fragments require context.
- All 122 complete JavaScript examples in the Algorithms category now parse. `tools/check_article_examples.js` also exercises corrected logic with fixed examples, boundary cases and deterministic generated cases. This is not an exhaustive correctness proof for every historical article.
- Existing article routes and publication dates are preserved. Added `translationKey` to 76 confirmed Chinese/English article pairs. Drafts remain drafts.

## Corrections made

| Area | Confirmed problem | Correction |
| --- | --- | --- |
| Imported algorithm examples | Lost newlines joined declarations and moved statements into line comments | Restored statement boundaries and readable formatting, including damaged translated code |
| Binary tree overview | Called a stack FIFO; described all DFS processing as bottom-up; templates were non-executable placeholders | Corrected LIFO/FIFO and traversal timing, with working DFS/BFS search templates |
| 1893 interval coverage | Subtracted arrays in sort; advanced the boundary incorrectly; mishandled inclusive endpoints | Sort by start and track the next uncovered integer; compare with brute-force coverage |
| 894 full binary trees | `dp[1]` was a node rather than an array; even subtree sizes led to invalid access | Store root arrays consistently and combine only odd subtree sizes; check tree counts and shapes |
| 347 top-k frequency | Heap selection did not maintain size k, used the wrong frequency sign, and returned string keys | Use a bounded min-heap with numeric values; test shuffled inputs and negative values |
| 1738 prefix XOR | Single-column matrices skipped later rows; one explanatory XOR expression repeated the wrong term | Use padded prefix-XOR DP; compare every k with independent rectangle-XOR calculations |
| 475 heaters | Binary search assumed sorted heaters and compared the wrong neighbors | Sort a copy, find the insertion point and compare both adjacent heaters |
| 875 banana speed | Sorting and binary-search bounds were swallowed by comments | Restore both brute-force and binary-search versions; test unsorted piles |
| 662 tree width | The middle attempt overwrote the maximum from earlier levels | Retain the previous maximum; preserve the documented progression to normalized indices |
| 778 rising water | Initial time-stepping example returned 1 for `[[0]]` | Handle the one-cell boundary case |
| Article labels | Path Sum II was numbered 133; Koko was mistranslated as Keke; splice/slice heading was misspelled | Correct display titles and headings without changing old URLs |
| Early MCP tools article | Tool/system token baselines contradicted the opening figures; claimed a universal loss of intelligence as context grows | Separate initialization categories, remove the inconsistent before/after claim, qualify observed effects and retain schema validation |
| Tool versus Code article | Suggested that tools fail before execution and code fails during runtime as an inherent split | Explain that both can validate early and fail at runtime; cite MCP execution-error semantics |
| React/3D synchronization | Guaranteed O(1) for JavaScript Map | Distinguish common average hash-table behavior from the specification's sublinear requirement |
| Asset recognition, part 2 | Percentage denominators and post-filter recall implications were underspecified | Define false positives among reported candidates and explain the data needed to reproduce the figures |
| Asset recognition, part 3 | Turned one orthographic integration failure into a general statement about Cesium | Scope it to the observed implementation and link the official picking API documentation |
| 2D/3D drawing registration | Suggested more points always improve fitting and RANSAC necessarily rejects a bad match | Explain anchor quality, consensus and the ambiguity of four points with a three-point minimal affine fit |
| Promise notes | Said handlers run immediately when the adopted promise has settled | Explain asynchronous reactions and the distinction between resolved and fulfilled; label the placeholder example as text |
| Historical login tutorial | Plaintext comparison, fixed signing key and encoding an entire user document into JWT | Add a prominent historical-example note, correct what the signing key means, and link password-storage guidance; the old authentication implementation still requires a rewrite |

## Findings that need original records or a separate rewrite

### Investment review: date and accounting scope

The Chinese `2025-年度投资总结.md` is dated 2025-12-24; its English translation is dated 2026-01-29. The Chinese body says “as of year end.” These may represent different publication dates, but the underlying data cutoff is not stated. Do not invent or automatically align either date.

The stated realized profit ($2,171), win rate (77.78%) and mean trade profit ($60.31) are arithmetically compatible with roughly 36 closed trades. That inference does not verify the underlying trades, fees, exchange rates, position grouping or treatment of open positions. The linked Colab notebook could not be read during this review. Confirm the data cutoff and accounting definition before treating these as audited portfolio returns.

### Asset detection: reproducibility

The quoted precision, recall and false-positive proportions are author-reported observations. The review clarified terminology; it did not independently validate the measurements. Publication-quality evidence would require labeled sample counts, evaluation scenes, model/version, matching/deduplication rules, verification coverage, and treatment of unverified candidates.

### Historical JavaScript tutorials

The old Vue/Express/MongoDB login walkthrough is explicitly historical and still contains an unsafe authentication implementation. Rewriting it needs a coherent password creation/verification, signing-key, expiry, authorization and session example; replacing a single line is insufficient.

Other 2018–2021 framework notes include incomplete snippets and old APIs. They were not all executed or migrated to current framework versions in this pass. The observer/Vue reactivity example, for example, still mixes `watchList` with `clientList`, and should be rebuilt as a complete, tested teaching example. The broader framework tutorial refresh remains separate from the completed algorithm recovery.

### Editorial quality

Several recent Agent essays repeat their thesis across many one-line paragraphs. Consolidating repeated passages and adding a concrete example, measured result, or failure log would make them more persuasive. The review preserved the author's personal experiences and opinions; it did not independently verify employer/project anecdotes.

## Sources used for technical checks

- [NIST stack definition](https://xlinux.nist.gov/dads/HTML/stack.html)
- [MCP tools and error handling](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [ECMAScript Map requirements](https://tc39.es/ecma262/multipage/keyed-collections.html#sec-map-objects)
- [Cesium Scene.pickPosition](https://cesium.com/learn/cesiumjs/ref-doc/Scene.html#pickPosition)
- [scikit-learn metric definitions](https://scikit-learn.org/stable/modules/model_evaluation.html#precision-recall-f-measure-metrics)
- [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- LeetCode official statements for problems [113](https://leetcode.com/problems/path-sum-ii/), [347](https://leetcode.com/problems/top-k-frequent-elements/), [894](https://leetcode.com/problems/all-possible-full-binary-trees/), and [1893](https://leetcode.com/problems/check-if-all-the-integers-in-a-range-are-covered/).
