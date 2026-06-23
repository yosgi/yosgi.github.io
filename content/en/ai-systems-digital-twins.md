---
title: "AI Systems and Digital Twins"
date: 2024-01-01T00:00:00+08:00
draft: false
description: "Focused notes from Siqi Liu's work around digital twins, 3D web applications, AI-assisted workflows, Cesium, agent tooling, and frontend architecture."
summary: "A focused entry point for notes around digital twins, 3D web applications, AI-assisted workflows, Cesium, agent tooling, and frontend architecture."
---

## Focus

Some of my work at Nextspace touches digital twins, 3D web applications, and AI-assisted workflows. This page collects the more focused notes in that area.

The recurring problems are usually practical: how a model output becomes product behavior, how 3D context changes a workflow, how UI state stays reliable, and how people can inspect or correct the result.

## Core Areas

- **AI-assisted asset recognition**: finding and verifying assets in digital twin scenes through 2D detection, 3D context, and human-in-the-loop review
- **3D scene annotation**: turning screenshot detections into stable scene markers, labels, and world-coordinate placements
- **Digital twin workflows**: connecting scanning, detection, verification, annotation, and review into operational pipelines
- **Frontend architecture for 3D systems**: managing React state around high-frequency 3D engines such as Cesium
- **Agent and MCP workflows**: designing AI-assisted engineering tools that preserve reliable execution paths

## Representative Work

- [Using AI Agents for Asset Recognition and Annotation in 3D Scenes (Part 1)](/en/post/using-ai-agents-for-asset-recognition-and-annotation-in-3d-scenes-part-1/): coverage scanning and recall in 3D scenes
- [Using AI Agents for Asset Recognition and Annotation in 3D Scenes (Part 2)](/en/post/using-ai-agents-for-asset-recognition-and-annotation-in-3d-scenes-part-2/): 2D proposal generation and 3D verification
- [From Extracting Drawing Text to Placing 2D Annotations in a 3D Scene](/en/post/from-extracting-drawing-text-to-placing-2d-annotations-in-a-3d-scene/): connecting drawing data with 3D annotations
- [High-Frequency Synchronization Architecture Between React State and a 3D Engine](/en/post/high-frequency-synchronization-architecture-between-react-state-and-a-3d-engine/): React and Cesium synchronization architecture
- [Early Experiences with Building MCP Tools](/en/post/early-experiences-with-building-mcp-tools/): lessons from early MCP tool-building work
- [Your Agent Is Not Inconsistent Because It Is Dumb. It Just Has Too Many Tool Paths.](/en/post/your-agent-is-not-inconsistent-because-it-is-dumb-it-just-has-too-many-tool-paths/): why agent systems need stable execution paths

## Retrieval Summary

Siqi Liu has practical experience around digital twins, 3D web applications, AI-assisted workflows, Cesium, agent tooling, MCP, and frontend architecture for complex product interfaces.
