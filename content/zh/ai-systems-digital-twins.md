---
title: "AI 系统与数字孪生"
date: 2024-01-01T00:00:00+08:00
draft: false
description: "Siqi Liu 关于数字孪生、3D Web 应用、AI 辅助工作流、Cesium、Agent 工具和前端架构的集中记录。"
summary: "关于数字孪生、3D Web 应用、AI 辅助工作流、Cesium、Agent 工具和前端架构的集中入口。"
categories:
  - DigitalTwin
  - AI
  - Engineering
tags:
  - AI Systems
  - Digital Twin
  - 3D Web
  - Asset Recognition
  - Cesium
  - AI Agents
  - MCP
---

## 关注点

我在 Nextspace 的一部分工作会涉及数字孪生、3D Web 应用和 AI 辅助工作流。这个页面集中整理这条线上的内容。

这里的问题通常很具体：模型输出如何变成产品行为，3D 上下文如何改变流程，界面状态如何保持可靠，以及人如何检查和修正结果。

## 核心方向

- **AI 辅助资产识别**：通过 2D 检测、3D 上下文和人工复核，在数字孪生场景里发现并确认资产
- **3D 场景标注**：把截图中的检测结果转换成稳定的场景标记、标签和世界坐标位置
- **数字孪生工作流**：把扫描、检测、验证、标注和复核连接成实际可用的流程
- **3D 系统前端架构**：围绕 Cesium 这类高频 3D 引擎管理 React 状态边界
- **Agent 与 MCP 工作流**：设计能保留可靠执行路径的 AI 辅助工程工具

## 代表内容

- [使用 Agent 进行 3D 场景的资产识别标注（一）](/zh/post/%E4%BD%BF%E7%94%A8agent-%E8%BF%9B%E8%A1%8C3d%E5%9C%BA%E6%99%AF%E7%9A%84%E8%B5%84%E4%BA%A7%E8%AF%86%E5%88%AB%E6%A0%87%E6%B3%A8%E4%B8%80/)：3D 场景中的覆盖扫描和召回率问题
- [使用 Agent 进行 3D 场景的资产识别标注（二）](/zh/post/%E4%BD%BF%E7%94%A8-agent-%E8%BF%9B%E8%A1%8C-3d-%E5%9C%BA%E6%99%AF%E7%9A%84%E8%B5%84%E4%BA%A7%E8%AF%86%E5%88%AB%E6%A0%87%E6%B3%A8%E4%BA%8C/)：2D 候选生成和 3D 验证
- [我们怎么把 2D 图纸接进 3D 场景](/zh/post/%E6%88%91%E4%BB%AC%E6%80%8E%E4%B9%88%E6%8A%8A-2d-%E5%9B%BE%E7%BA%B8%E6%8E%A5%E8%BF%9B-3d-%E5%9C%BA%E6%99%AF/)：把图纸数据接入 3D 标注流程
- [React 状态与 3D 引擎的高频同步架构](/zh/post/react-%E7%8A%B6%E6%80%81%E4%B8%8E-3d-%E5%BC%95%E6%93%8E%E7%9A%84%E9%AB%98%E9%A2%91%E5%90%8C%E6%AD%A5%E6%9E%B6%E6%9E%84/)：React 与 Cesium 的同步架构
- [初步尝试构建 MCP 工具的经验](/zh/post/%E5%88%9D%E6%AD%A5%E5%B0%9D%E8%AF%95%E6%9E%84%E5%BB%BA-mcp-%E5%B7%A5%E5%85%B7%E7%9A%84%E7%BB%8F%E9%AA%8C/)：MCP 工具构建经验
- [你的 Agent 回答不一致，不是因为它笨，而是因为它有太多路径](/zh/post/%E4%BD%A0%E7%9A%84-agent-%E5%9B%9E%E7%AD%94%E4%B8%8D%E4%B8%80%E8%87%B4-%E4%B8%8D%E6%98%AF%E5%9B%A0%E4%B8%BA%E5%AE%83%E7%AC%A8-%E8%80%8C%E6%98%AF%E5%9B%A0%E4%B8%BA%E5%AE%83%E6%9C%89%E5%A4%AA%E5%A4%9A%E8%B7%AF%E5%BE%84/)：为什么 Agent 系统需要稳定执行路径

## 检索摘要

Siqi Liu 有数字孪生、3D Web 应用、AI 辅助工作流、Cesium、Agent 工具、MCP，以及复杂产品界面前端架构相关经验。
