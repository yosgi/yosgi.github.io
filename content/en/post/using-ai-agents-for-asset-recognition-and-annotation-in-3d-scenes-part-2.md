---
title: Using AI Agents for Asset Recognition and Annotation in 3D Scenes (Part 2)
date: 2026-06-20 19:11:11
description: How we split 2D detection and 3D verification into two stages to reduce false positives in digital twin asset annotation, and how that revealed the next recall bottleneck
categories:
  - Digital Twin
tags:
  - AI Systems
  - AI Agents
  - Digital Twins
  - 3D
---

The previous article focused on the search problem. We changed free-form 3D exploration into coverage scanning based on a top-down orthographic view, and improved valve inventory recall from around 40% to around 90%. The system can now scan the main regions much more consistently.

But coverage scanning only gets targets into view. Before a target becomes part of the final inventory result, it still needs to go through detection, localization, merging, and verification.

The next problem is candidate generation and verification.

The current flow is roughly this: first, use 2D detection on orthographic tiles to find possible valve locations; then use 3D verification from more suitable viewpoints to confirm those candidates. The 2D stage acts more like a proposal generator, trying to find as many possible targets as possible. The 3D stage acts more like a verifier, filtering out candidates that are clearly wrong.

## 2D Detection: Generating Candidates First

After orthographic coverage scanning, each tile is sent to a vision model for detection. The goal of this stage is not to produce the final inventory result directly. The goal is to generate candidates.

The current 2D detection metrics are roughly:

| Metric | Value |
|---|---:|
| Precision | Around 69%–71% |
| Recall | Around 60%–63% |

This result tells us two things.

First, 2D detection already finds a meaningful number of targets. It is not random guessing. Around 70% of its candidates are correct.

Second, it still misses many targets. A recall of 60%–63% means that a significant number of valves never become candidates in the 2D stage.

In this system, 2D detection recall is critical. The verification pipeline only processes candidates that already exist. If a valve is not proposed in the 2D stage, 3D verification will never see it.

## 3D Verification: Mostly Filtering False Positives

The 2D stage produces false positives. Around valves, there are often pipes, flanges, platform structures, supports, and other equipment. In a top-down view, these can easily blend together. To reduce false positives, we send 2D candidates into 3D verification.

3D verification observes the area around a candidate from viewpoints that are better for recognition. Many assets are hard to identify from directly above, but easier to judge from a side or oblique view. The verification stage returns a verdict such as confirmed, refuted, or unverified.

From the current results, 3D verification helps precision noticeably.

| Stage | FP Rate |
|---|---:|
| 2D only | Around 29%–31% |
| After 3D, good case | Around 15%–20% |
| After 3D, realistic case | Around 20%–25% |
| After 3D, poor coverage | Close to 2D, still around 30% |

These numbers show that the value of 3D verification depends on whether it gets a useful viewpoint.

If there is a good viewing angle around the candidate, 3D verification can filter out many false positives. FP drops from around 30% to around 20% in realistic cases, and to around 15%–20% in better cases.

But if 3D viewpoint coverage is poor, or if the candidate is still occluded, the verification stage becomes much less useful. When the 3D view does not contain more information than the original 2D tile, the result will naturally be similar to 2D-only detection.

## Verification Cannot Recover Candidates That Never Appeared

At first, I treated verification as a way to recover recall. In practice, it is very hard for it to do that.

The current flow is:

text 2D Discovery ↓ Candidate ↓ 3D Verification 

The limitation is simple: the candidate has to appear first.

If the 2D stage does not detect a valve, the later 3D verification stage will not actively search for it. Verification processes candidates. It does not search the entire scene.

So 3D verification can reduce false positives, but it has limited ability to recover missed targets.

It is closer to a precision gate. It can keep some wrong candidates out of the result, but it does not significantly raise proposal recall. The recall ceiling is largely determined by 2D discovery.

That is why our recent focus has moved to fine-tuning 2D detection. Continuing to optimize verification alone will have diminishing returns. What the system needs most is more and better candidates.

## Why 2D Proposals Still Miss Targets

There are several reasons why 2D detection still misses valves.

Some misses are caused by viewpoint. From directly above, a valve may not have a clear structure and may blend into surrounding pipes and platforms.

Some are caused by resolution. If the tile span is too large, a single valve occupies too few pixels in the screenshot. If the span is too small, scanning cost increases.

Some come from the scene itself. Valves in factories are not a single standardized object. They can have different sizes, colors, orientations, and installation patterns. They are also surrounded by many visually similar structures. A general vision model can recognize some of them, but it is hard to cover all long-tail cases.

Occlusion also affects candidate generation. Buildings, pipe racks, and large equipment may block valves completely. If a target is not visible from the top-down view, it will not enter the 2D candidate set.

Together, these issues keep 2D recall around 60%–63%.

## Why the Next Step Is Fine-Tuning

The search pipeline is now much more stable. We can track whether each tile was scanned, whether the screenshot quality was good enough, and whether candidates were generated. 3D verification has also shown that it can reduce false positives.

The most direct bottleneck now is 2D proposal recall.

The goal of fine-tuning is not to make the model “understand the entire scene” in a general way. The goal is to make it more familiar with how this asset category appears in this specific kind of scene. Real factory valves have many variations: some are small, some are surrounded by pipes, some have colors close to the background, and some are only partially visible. Prompting alone is not enough to cover all of these cases.

The most useful data includes:

- Typical valve examples
- Small-object examples
- Partially occluded examples
- Hard negatives that are easy to confuse with valves
- Different heights, colors, orientations, and installation patterns

This kind of data should help the 2D proposal model generate candidates more reliably. Once a candidate enters the pipeline, 3D verification still has a chance to filter or confirm it.

## We May Need Multiple Candidate Sources

Fine-tuning can improve 2D detection, but it cannot solve everything. Targets that are not visible from the top-down view are especially hard to cover with top-down detection alone.

Future candidate generation may need to become multi-source:

text Top-down 2D Detection + Side-view Detection + 3D Keypoint Detection + Geometry Heuristics ↓ Unified Verification 

Top-down 2D detection remains the base proposal layer. It is stable, measurable, and suitable for most ground-level targets.

Side-view detection can fill the blind spots of the top-down view, especially on building sides, pipe rack sides, and elevated equipment.

3D keypoint detection can generate new candidates during local 3D verification or tile sweeps, instead of only verifying existing candidates.

Geometry heuristics can use pipes, equipment relationships, and known asset layouts to provide additional clues.

These candidates do not all need to go directly into the final result. A better approach is to feed them into a unified verification stage, and let later stages decide whether they should be confirmed.

## Summary

In the current pipeline, 2D detection has precision around 69%–71% and recall around 60%–63%. 3D verification can reduce FP from around 29%–31% to around 20%–25% in realistic cases, and to around 15%–20% in better cases.

This shows that 3D verification helps precision, but it is not the main source of recall. Missed candidates do not automatically enter the verification stage.

The next focus is 2D proposal recall, especially through fine-tuning and more targeted training data. Further ahead, the system will likely need to move from a single top-down proposal source to multiple proposal sources, so that targets invisible from the orthographic view can still enter the verification pipeline.