---
title: 使用 Agent 进行 3D 场景的资产识别标注（二）
date: 2026-06-20 14:11:11
description: 如何把 2D 检测和 3D 验证拆成两个阶段，在数字孪生工厂的资产标注中降低误报，并定位下一步的召回率瓶颈
categories:
  - DigitalTwin
  - Ai
---

上一篇主要讲搜索问题。我们把自由 3D 探索改成了基于正射视角的覆盖扫描，阀门盘点的召回率从约 40% 提升到了约 90%。现在系统能比较稳定地把主要区域扫到。

但覆盖扫描只是把目标送进视野。真正进入盘点结果之前，还需要经过检测、定位、合并和验证。

接下来就是候选生成和验证。

现在的流程大致是：先用 2D detection 在正射 tile 里找出可能是阀门的位置，再用 3D verification 从更合适的视角确认这些候选。2D 阶段更像 proposal generator，负责尽量多找；3D 阶段更像 verifier，负责把明显不对的候选过滤掉。


## 2D detection：先把候选找出来

正射覆盖扫描以后，每个 tile 都会被送进视觉模型做检测。这个阶段的目标不是直接给出最终盘点结果，而是尽量生成候选。

当前 2D detection 的指标大致是：

| 指标 | 数值 |
|---|---:|
| Precision | 约 69%–71% |
| Recall | 约 60%–63% |

这个结果有两个含义。

第一，2D detection 已经能找到不少目标。它不再是随机猜测，输出的候选里大约七成是对的。

第二，它仍然会漏掉不少目标。Recall 只有 60%–63%，说明还有相当一部分阀门没有在 2D 阶段变成候选。

在这个系统里，2D detection 的 recall 很关键。后面的验证流程只会处理已经生成的候选。如果一个阀门在 2D 阶段没有被提出来，3D verification 就不会看到它。



## 3D verification：主要作用是过滤误报

2D 阶段会产生误报。阀门周围通常有管道、法兰、平台结构、支架和其他设备，在俯视图里很容易混在一起。为了减少误报，我们会把 2D 候选送到 3D verification。

3D verification 会围绕候选位置，从更适合识别的视角重新观察目标。很多设备从正上方看不清楚，从侧面或斜侧面看会更容易判断。验证阶段的目标是给候选一个结论：`confirmed`、`refuted`，或者 `unverified`。

从目前结果看，3D verification 对 precision 的帮助比较明显。

| 阶段 | FP 比例 |
|---|---:|
| 2D only | 约 29%–31% |
| 3D 后，效果较好时 | 约 15%–20% |
| 3D 后，现实情况 | 约 20%–25% |
| 3D coverage 不好时 | 可能接近 2D，仍约 30% |

这个数据说明，3D verification 的收益取决于它是否真的拿到了有用视角。

如果候选附近有合适的观察角度，3D verification 可以把不少误报过滤掉。FP 从约 30% 降到 20% 左右，效果好的时候可以到 15%–20%。

但如果 3D 视角覆盖不好，或者候选被遮挡，verification 的作用就会明显下降。它看到的画面不比 2D 阶段更有信息量时，结果自然也不会好很多。

## Verification 救不了没有出现的候选

一开始我把 verification 当成 recall 的补救手段，但实际上它很难做到这一点。

当前流程是：

```text
2D Discovery
↓
Candidate
↓
3D Verification
```

限制是候选必须先出现。

如果 2D 阶段没有检测到某个阀门，后面的 3D verification 不会主动去找它。验证阶段处理的是候选，不是全场景搜索。

所以3D verification 能降低误报，却很难恢复漏检。

3D verification 更像 precision gate。它可以把一些错误候选挡在结果之外，但它不会显著抬高 proposal recall。最终 recall 的天花板，很大程度上由 2D discovery 决定。

所以最近我们的重点放在 fine-tuning 2D detection 上。只继续优化 verification，收益会越来越有限。真正缺的是更多、更准的候选。

## 为什么 2D proposal 还会漏

2D detection 的漏检来源比较复杂。

有些是视角问题。阀门从正上方看结构不明显，和周围管道、平台混在一起。

有些是分辨率问题。tile span 太大时，单个阀门在截图里占的像素太少；span 太小时，扫描成本又会上升。

还有一些是场景本身的问题。工厂里的阀门不是一个标准化物体，它可能有不同尺寸、不同颜色、不同安装方向，周围还会有各种相似结构。通用视觉模型能识别一部分，但很难覆盖所有长尾情况。

遮挡也会影响候选生成。建筑物、管廊和大型设备可能直接挡住阀门。正射视角下看不到的目标，自然不会进入 2D 候选集。

这些问题混在一起，最后就表现为 2D recall 卡在 60%–63% 左右。

## 为什么下一步是 fine-tuning

现在的系统已经把搜索流程稳定下来了。每个 tile 是否扫描过、截图质量如何、候选有没有产生，都可以追踪。3D verification 也已经证明能降低误报。

因此，下一步最直接的瓶颈是 2D proposal recall。

fine-tuning 的目标不是让模型“更聪明”地理解整个场景，而是让它更熟悉这个资产类别在这个场景里的样子。阀门在真实工厂里有很多变体：有些很小，有些被管道包围，有些颜色和背景接近，有些只露出一部分。靠 prompt 很难覆盖这些情况。

更有价值的数据包括：

- 典型阀门样本
- 小目标样本
- 部分遮挡样本
- 容易误判的 hard negatives
- 不同高度、颜色、方向和安装方式的样本

这类数据能帮助 2D proposal model 更稳定地产生候选。只要候选能进入后续流程，3D verification 就还有机会做过滤和确认。

## 后面可能需要多来源候选

Fine-tuning 能提升 2D detection，但它不能解决所有问题。尤其是那些从正射视角不可见的目标，仅靠 top-down detection 很难覆盖。

后续候选来源可能需要扩展成多路：

```text
Top-down 2D Detection
+
Side-view Detection
+
3D Keypoint Detection
+
Geometry Heuristics
↓
Unified Verification
```

Top-down 2D detection 继续作为基础 proposal layer。它稳定、可覆盖，适合处理大部分地面层目标。

Side-view detection 可以补正射视角的盲区，尤其是建筑物侧面、管廊侧面和高架设备。

3D keypoint detection 可以在局部 3D verification 或 tile sweep 中找新的候选，而不仅仅是验证已有候选。

Geometry heuristics 可以利用管线、设备连接关系和已知资产分布，为模型提供额外线索。

这些候选不一定都直接进入最终结果。更合理的方式是统一进入 verification，再由后续阶段判断是否确认。

## 小结

目前这条链路里，2D detection 的 precision 大约是 69%–71%，recall 大约是 60%–63%。3D verification 可以把 FP 从约 29%–31% 降到现实情况下的 20%–25%，效果好的时候可以到 15%–20%。

这说明 3D verification 对 precision 有帮助，但它不是 recall 的主要来源。漏掉的候选不会自动进入验证阶段。

所以接下来的重点会放在 2D proposal recall 上，尤其是通过 fine-tuning 和更有针对性的数据提高候选生成能力。再往后，系统需要从单一 top-down proposal 扩展到多来源 proposal，让那些从正射视角不可见的目标也有机会进入验证流程。