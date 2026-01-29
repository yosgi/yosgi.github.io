---
title: "[DevLog #01]为了云养猫，我决定从零写一个 Web 小游戏（day 1"
description: Tiled 地图绘制与优化
categories:
  - Technology
date: 2025-12-11 00:00:00
---

## 1. 前言：为什么要开这个坑？


作为一名开发者，其实一直有一个小小的执念：


**想做一款真正属于自己的游戏。**


不是为了商业化，也不追求多复杂的系统，只是想把“写代码”这件事，和“有趣”结合起来。


于是就有了这个想法——


**做一个治愈系的养猫 Web 短小游戏。**

- 偏休闲
- 偏放松
- 打开网页就能“云养猫”

当然，理想很美好，现实也很骨感。


### 现实挑战一：美术资源有限

- 不会画画
- 没有预算请美术

解决方案很简单粗暴：


**全部使用网上优质的免费 2D 像素风素材**。


目前主要参考和使用的来源包括：

- Itch.io

免费、质量稳定，而且非常适合新手项目。


### 现实挑战二：开发资源有限

- 只有我一个人
- 时间和精力都有限

技术选型上，我选择了 **Cocos Creator**。


主要理由：

- 对 **TypeScript 非常友好**
- 支持一键发布到 **Web / iOS / Android**
- 引擎成熟，生态完整
- 对 2D 游戏支持很好

在“功能”和“复杂度”之间，Cocos 是一个比较平衡的选择。


---


## 2. 第一步：搞定游戏世界的「地基」——地地图


正式开始写逻辑之前，我先做的一件事是：


**把游戏世界的地基搭起来**。


这里用到的核心工具是：


> Tiled Map Editor


### 什么是 Tilemap（瓦片地图）？


简单理解就是：

- 用很多小方块（Tile）
- 像拼图一样
- 拼出一个完整的大地图

这种方式的优点非常明显：

- 资源复用率高
- 地图修改成本低
- 对性能友好
- 非常适合 2D 游戏

对新手来说，Tilemap 几乎是必选方案。


---


## 3. 地图「分层」（Layering）


我地图拆成了 **三层**。


目的不只是结构清晰，更重要的是——**渲染性能优化**。


---


### Layer 1 & Layer 2：基础地形层（Base Terrain）


**内容：**

- 草地（Grass）
- 沙漠 / 土地（Sand / Ground）

### 为什么基础地形要拆成两层？


**1️⃣ 编辑便利性**

- 更容易处理不同地形之间的过渡边缘
- 不同笔刷互不干扰，修改成本更低

**2️⃣ 渲染优化（Draw Call & Culling）**

- 大面积、纯静态的地形非常适合单独成层
- 在 Cocos 中，可以更好地利用 **Culling（剔除）**
  - 屏幕外的地形不需要渲染
- 静态背景层可以被引擎进行 **Batching（合批）**
  - 明显减少 Draw Call
  - 降低 Web 端渲染压力

---


### Layer 3：装饰 / 遮挡层（Decoration / Obstacles）


**内容：**

- 蘑菇
- 石头
- 树木等装饰物

**这一层的核心作用：**

- 这些元素通常存在 **遮挡关系**
- 或者后续需要 **碰撞体积**

把它们单独拆出来，有两个明显好处：

- 后续在 Cocos 中可以统一添加

  `Collider / RigidBody`

- 不需要去污染复杂的地形层逻辑

 地形负责“地面”，装饰负责“物体”，职责非常清晰。


---


## 4. 实战过程


这一阶段基本都是体力活，但非常解压。


### 1️⃣ 素材导入

- 下载像素风 Tileset
- 导入到 Tiled 中
- 确保 Tile 尺寸统一（如 16×16 或 32×32）

### 2️⃣ 刷基础地形

- 先用草地铺满整个背景
- 再用沙漠 / 土地画出小路或区域

### 3️⃣ 点缀装饰物

- 切换到 Layer 3
- 放一些石头、蘑菇
- 让地图看起来不那么“空”

### 4️⃣ 导入 Cocos Creator

- 将生成的 `.tmx` 文件直接拖入 Cocos
- 在编辑器中查看效果
- 确认分层和渲染都正常

这一刻看到地图真正出现在引擎里，还是挺有成就感的。


![](https://prod-files-secure.s3.us-west-2.amazonaws.com/4ebc926d-a5ea-4392-a4ae-a936f72673cd/d3e19b02-e290-4a5a-aee7-8c31a522cd73/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466YBESGOTC%2F20260129%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260129T043529Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIEZCZno2cVqg6%2FVymbhFdr0G7o58Mb%2BV4EIyWEl7CszMAiEAoLKgu7vorF5Ol0hotz2HTfnra3CI4WxWnZ1QoemnrcAq%2FwMIfRAAGgw2Mzc0MjMxODM4MDUiDDgZ7y%2FX9782RT0naircA1o4kFy7Z6C8czoYjUCr97VutKW6pwbPFIJGUf%2F6j5C9SbWQ7VY0A6iZYoev0mn3fPeuYG6VtLazy98vV6WW98R74mNXy19l881fFEjnDY9a1r1O992Xu5FcuGRF7ez%2FbpQq0RzsdlXEB025irX7efGhi8V4pwPa2V01C5Fabxu%2BdzGTZ0O%2FhPUo71O9relr%2BEI8uHHiT9yplY8yVDkPOJEk2YPYJAAm16bX0OJGc04RrG%2Fj%2BVhwS1FP6gjZmrEMpxavZRk6UbDmnk1p3ivJLG0bIXzrImHSLfKd4SA%2FZWSl3adAUN%2BFtR4Vc6QUvcDQYwnS4zN9E4mslAOqRnXmAghuX447N3UfRr0Eo2qiQFf93ONeX5KY7WufM4ul%2BtlHYfWgMY4pujpf%2F%2FdrjCTh5J8dqL%2FQ2HtJbEOej4jAn9cAQs0%2FM8dNnIENU8h3W4gfryee%2FSIIyi%2FQMS%2BSJeJKUf0nTr6ANM7K%2FHz%2FDNizChmuJdZy6bdNvykXG476Cps1Y3BXBXx3RrOSn%2B0%2FWl5r8jj6tQqQ7bQzA8lpkIsB%2BFDIbry1oiGWQQ3KCsslakKhEmDJJEyfSY8zTUZ%2BFE0RD5nw5oREmCAmvSt37r9H42IHzqaHZHMciFu3xIYPMN2n68sGOqUBrvy2smwuyJ3z7fpqThQf0ZUOXRFC7ZhQ5C%2BcQ0FgrO9XBtQkWpVhZtilI31drD06pHHPVPQagxDO1qSpt1V0z2bngDmqaT8NrP7RIVvg4VuwTTY5foqufCavLOctGOk4my8POxl%2Bu7buKvNcgqBWhHAfF%2BJIt1Ep337Ilzwv%2FhoWHJh0J7WKqLJ9J76kDX9chPcZTQFGpirZWcuXpXO9p00YXLyn&X-Amz-Signature=6ea8dab6a58e56d6082113c00d26f5e2738fe32204bf2153dfa0622854cbc6b9&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


---


## 5. 小结与下一步计划


目前这个项目还处在**非常早期的阶段**：

- 地图结构已确定
- 分层策略已验证
- 素材和工作流跑通

接下来准备做的事情包括：

- 加入猫咪角色
- 简单的行为逻辑
- 基础互动（点击、喂食等）

这个 DevLog 系列会尽量保持：

- 新手视角
- 不回避踩坑
- 一步一步真实记录

如果你也对游戏开发感兴趣，或者同样是一个人、资源有限，其实不用给自己太大压力。


**把项目拆小，慢慢推进，就已经赢过很多“只想不做”的阶段了。**
