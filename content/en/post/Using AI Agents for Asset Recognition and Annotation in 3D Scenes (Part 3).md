---
description: Making scan results land in the right place
title: Using AI Agents for Asset Recognition and Annotation in 3D Scenes (Part 3)
date: 2026-06-23 14:00:00
categories:
  - DigitalTwin
  - AI
---

Coverage scanning solved the question of where to look. 2D detection and 3D verification solved the question of how to judge what was found. In practice, there is another problem that is easy to underestimate: the model detects a position in a screenshot, but the final annotation needs to be created accurately in the 3D scene.

If this step is unstable, even a correct recognition result is not enough. If a marker lands on a nearby pipe, platform, or patch of ground, the user still sees a wrong result.

This article focuses on the engineering chain between screenshot detection and 3D annotation, and some of the Cesium issues we ran into along the way.

## From Screenshot Coordinates to World Coordinates

A vision model sees a screenshot. It returns a location in that screenshot, either as a point or as a bounding box. But asset inventory needs the actual entity position in the 3D scene.

The chain looks roughly like this:

text Camera pose ↓ Rendered frame ↓ VLM detection ↓ Pixel coordinate ↓ World coordinate ↓ Marker / callout 

If any step in this chain is wrong, the final symptom may look like “the model is inaccurate.” But in many cases, the issue is not the model. It can be screenshot quality, camera state, coordinate mapping, or scene depth resolution.

So we separated this part from model recognition. The model is responsible for judging what may be present in the image. Geometry and coordinate problems should be solved as deterministically as possible.

## Do Not Rely on Depth Picking in Orthographic View

At first, we tried to use Cesium’s scene.pickPosition directly to convert a detection point from screen coordinates back into world coordinates. This can sometimes work in perspective view, but it is unreliable in orthographic view.

We saw logs like this:

text pickPosition: [115.7441, 57.9449, -6343534] globePick:    [115.7887, -32.1432, -27.8] 

The latitude and height returned by pickPosition were clearly wrong. The height was even close to negative one Earth radius. The final marker would naturally be placed far away from the intended target.

This kind of issue is easy to misread as poor model localization. In reality, the model may have pointed to the correct position in the screenshot, while the pixel-to-world coordinate conversion was wrong.

Later, in orthographic scanning, we switched to an analytic mapping based on known camera and tile parameters. For each tile, the center, span, canvas aspect ratio, and detection pixel coordinate are known, so the ground position can be computed directly.

In this flow, we no longer rely on pickPosition for depth reconstruction.

## Camera State Needs to Be Recorded Completely

Another issue came from restoring camera state.

In perspective view, zooming usually changes the camera position. In orthographic view, zooming changes frustum.width, while the camera position and direction may stay the same.

This affects many things that may look unrelated, such as:

- whether the pick cache should be invalidated
- whether restoreCamera actually returns to the same screenshot state
- whether detection resolution uses the same zoom as the original capture

We ran into a typical offset issue: the screenshot was captured at one orthographic zoom level, but when resolving the detection later, the camera was not fully restored and frustum.width had been reset. As a result, the farther the detection point was from the center of the image, the larger the offset became after mapping it back to world coordinates.

From the output, this looked like “the model’s box was off.” The real problem was incomplete camera state.

After that, we explicitly saved the key orthographic camera state, especially frustum.width. Anything related to caching, restoring the camera, or resolving detections cannot rely only on camera position and direction.

## Tile Coverage Needs to Use the Real Frame Footprint

There is another easy mistake in coverage scanning: the tile footprint is not square.

At first, we used the same span as both the horizontal and vertical step size, effectively assuming that each screenshot covered a span × span square region. But the actual orthographic frame size depends on the canvas aspect ratio.

If the aspect ratio is 1.88, then when the horizontal coverage width is span, the vertical coverage height is roughly:

text frameH = span / 1.88 

So the actual height is only a little more than half of the width.

If we still place vertical tiles using span, large gaps appear between rows. The system may appear to have scanned many tiles, while some regions never entered any screenshot.

We later changed tile planning to use the real frame footprint:

text frameW = span frameH = span / aspect 

Then we calculate the number of columns and rows based on frameW and frameH. Edge tiles also need to be clamped so that the frame does not go outside the scan boundary unnecessarily.

There are two goals to satisfy at the same time:

- the scan frame should not go too far outside the boundary
- the region inside the boundary should not have coverage gaps

If this part is wrong, it directly affects the coverage scanning discussed in Part 1. Coverage does not automatically become correct just because there are many tiles. It has to be computed from the real camera footprint.

## Screenshot Quality Is Part of the Detection Chain

A VLM does not see the Cesium scene itself. It sees one rendered frame.

This became an important point later. Many detection problems looked like model capability issues, but were actually image quality issues.

During scanning, if the 3D Tiles have not loaded enough detailed LOD, the equipment in the screenshot becomes blurry. Valves are small targets, and when LOD is too coarse, they easily blend into pipes and platforms.

During scanning, we temporarily adjusted the tileset’s maximumScreenSpaceError so that the current tile loads a finer LOD. After the scan, we restore the original setting.

Another issue is when to capture. Early on, we used “the canvas no longer changes visibly” as the signal that the screenshot was stable, but this signal is unreliable. A static frame may mean loading is complete, or it may mean loading has stalled.

Later, we relied more on Cesium’s tilesLoaded state to make sure the current tile was actually loaded before taking the screenshot.

This had a large impact on detection quality. If the input image is not clear, even a strong model will struggle to recognize targets consistently.

## Human-Facing Overlays Should Not Enter Model Input

We also ran into a very practical issue. To show scan progress to humans, we once drew tile overlays in the scene, using different colors for planned, active, done, and skipped.

This UI was useful for debugging. A person could immediately see where the system had scanned.

But those overlays appeared in the screenshots sent to the model. The model no longer saw a clean factory image; it saw the factory with colored overlays on top. This polluted the visual input and affected detection results.

We later separated human-facing visualization from model input. Scan progress can be shown in a side panel, HUD, or separate debug layer, but it should not appear in the screenshots passed to the model.

This kind of issue is easy to miss. The interface for human observation and the interface for model observation do not always need to be the same.

## Annotation Results Need to Be Reviewable

Asset annotation is not a one-off screenshot analysis. The final result stays in the 3D scene and may be reviewed, edited, exported, or used in later workflows.

So each annotation should ideally be traceable:

- which tile it came from
- what the camera state was at capture time
- where the detection point was in the image
- what parameters were used to map it into world coordinates
- whether it went through 3D verification
- what the verification result was

This information matters for debugging. If a user sees a marker in the wrong place, the system needs to determine whether the issue came from detection, pixel-to-world mapping, tile LOD, or verification.

Without this intermediate data, every problem eventually collapses into the vague explanation: “the model is inaccurate.”

## Summary

The most important lesson from this part is that geometry problems should be solved with geometry whenever possible. In orthographic view, pixel-to-world mapping, tile footprint, camera frustum, and LOD loading state should not be left for the model to guess.