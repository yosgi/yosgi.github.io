---
title: Using AI Agents for Asset Recognition and Annotation in 3D Scenes
date: 2026-06-19 09:46:11
description: How we turned free-form 3D exploration into measurable coverage scanning and improved valve inventory recall in a digital twin factory from around 40% to around 90%
categories:
  - Digital Twin
tags:
  - AI Systems
  - AI Agents
  - Digital Twins
  - 3D
---

Our initial requirement was straightforward: in a 3D digital twin factory, find all the valves and mark them.

This was a test scenario. Valves appear frequently in factories and are distributed across many different areas, so they make a representative example for asset inventory.

![[static/images/Using AI Agent for Asset Recognition and Annotation in 3D Scenes/Screenshot 2026-06-23 at 5.15.30 PM.png]]

The system already had the basic capabilities: camera control, screenshot capture, a vision model, and scene annotation. The first approach was simple: let the Agent move the camera around the 3D scene, mark valves when it saw them, and then continue looking elsewhere, similar to how a human would inspect the scene.

This approach ran into problems quickly.

When looking at a single clear image, recognizing a valve was not the hardest part. The more common failures happened during scanning: the camera angle was not suitable, the target was blocked by platforms or buildings, the target appeared as only a few pixels in a distant view, or the model detected the target but the annotation was misplaced when projected back into the 3D scene.

These problems accumulated and showed up as low recall. In our tests, free-form 3D exploration achieved only around 40% recall for valves.

We gradually realized that inventory should not be treated only as a recognition problem. A recognition model can only process targets that have already entered its view. If a target is not captured clearly by the camera, or does not appear from a useful angle, the downstream model never gets a real chance to handle it.

So the first problem to solve was search.

## Why Free-Form 3D Exploration Was Unstable

Free-form exploration in a 3D scene is close to how humans browse a scene. A person can zoom in, rotate the view, move around occlusions, and check the same object from another angle. It is much harder for an automated system to complete an inventory reliably in this way.

The same valve can look very different from different viewpoints. From the side, the valve body, handwheel, and connected pipes may be clear. From above, it may look like a small block. From a distant view, it may occupy only a few pixels. When blocked by pipes or buildings, only part of it may be visible. A small change in the camera path can produce a very different model input.

Localization adds another problem. Inventory is not only about answering “is there a valve in this image?” The system also needs to convert the detection into world coordinates and create a marker or callout in the 3D scene. Industrial scenes contain many layers: ground equipment, platforms, pipe racks, buildings, and towers. A point on the screen may correspond to multiple depth layers. A correct recognition result does not necessarily mean the final annotation lands in the correct place.

The harder issue is defining what it means to have “looked through the whole factory.” Seeing an area from one angle does not mean all assets in that area were visible. Covering a patch of ground from above does not mean valves behind a building facade or under a platform were seen. After many steps of free-form scanning, it was still difficult to answer which areas had been systematically checked and which areas had not.

This led to the change in direction. We needed to make the search process measurable.

## Fixing the Search Space

The new approach starts with a top-down orthographic view, turning the factory into a stable two-dimensional search space.

In an orthographic view, there is a more stable relationship between image pixels and ground area. This allows the system to determine the factory boundary, split the region into tiles, and scan them one by one.

The original process was:

text Move the camera around the 3D scene Detect whatever is visible Continue moving based on the result 

The new process became:

text Determine the factory boundary Divide it into scan tiles Run detection on each tile Merge candidate targets Send candidates into 3D verification 

This change does not mean replacing 3D with 2D. Many assets are still easier to confirm from a side view, and 3D viewpoints remain important during verification.

The division of responsibility changed: 2D provides a stable search space, and 3D confirms candidate targets. Global search no longer depends on free camera movement in 3D space. Instead, the system first generates candidates through 2D coverage, then passes those candidates to later verification steps.

## Results

This change brought a clear improvement.

| Method | Recall |
|---|---:|
| Free-form 3D exploration | Around 40% |
| Coverage-based scanning | Around 90% |

Recall improved from around 40% to around 90%. The main gain came from making the search process more stable. Previously, many targets were never captured reliably, so the recognition model never had a chance to process them. Coverage scanning allowed the system to inspect the main regions according to a plan and send most candidate targets into the downstream pipeline.

Debugging also became clearer. When a target was missed, we could check whether the corresponding tile had been scanned, whether the scan resolution was sufficient, and whether a candidate was produced in that tile. In the free-form exploration mode, these questions were much harder to separate.

## After Coverage, the Problem Becomes Visibility

Coverage scanning solved the main region-search problem, but it did not make inventory recall 100%.

The remaining misses were mainly caused by visibility. Some valves were blocked by buildings or large structures. From the top-down 2D view, they were not visible, so the 2D stage did not generate candidates. The current 3D verification step is triggered by candidates; if no candidate is generated, the later verification stage never happens.

So the current pipeline is effective for filtering false positives, but it has limited ability to recover targets missed by the 2D stage.

The flow is essentially:

text 2D Discovery ↓ Candidate ↓ 3D Verification 

This chain depends on candidates being generated first. If a target is not visible from the top-down view, the system needs other candidate sources.

The next direction is to improve candidate generation. On one hand, we will continue fine-tuning 2D detection to improve the recall of the current proposal stage. On the other hand, we need to introduce additional sources, such as side-view detection, 3D keypoint detection, and geometry heuristics.

In other words:

text Top-down 2D Detection + Side-view Detection + 3D Keypoint Detection + Geometry Heuristics ↓ Unified Verification 

2D coverage remains the base search layer. It provides a stable and measurable scanning process. Side-view and 3D candidate generation can fill in the blind spots of the top-down view, especially for elevated equipment, assets blocked by buildings, and equipment inside or beside pipe racks.

## Summary

Recognition models are important, but they can only process targets that have entered the view. Free-form 3D exploration makes it hard to answer “where have we already looked?” Orthographic coverage scanning turns search into a process that can be checked, reviewed, and improved.

In the valve scanning test, this change improved recall from around 40% to around 90%. The next stage will focus on candidate generation and visibility, especially for targets blocked by buildings, located in elevated structures, or otherwise difficult to see from a top-down orthographic view.