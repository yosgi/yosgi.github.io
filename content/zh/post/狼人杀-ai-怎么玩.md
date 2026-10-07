---
title: "凑不齐一桌人，我做了个能和 AI 玩的狼人杀"
date: 2026-10-07T16:00:00+13:00
description: "我喜欢狼人杀，但大家工作后很难凑齐人，所以做了一个可以让 AI 补位的线上版本。"
categories:
  - Projects
tags:
  - Game Development
  - AI
draft: false
translationKey: werewolf-ai-intro
---

我很喜欢玩狼人杀，但它有个现实问题：人太多了。大家工作以后，各有各的时间，要凑齐一桌人越来越难。有时候真的想玩一局，却卡在“还差几个人”。

所以我做了《狼人杀 AI》。你可以像平常一样和朋友建房、发房间码，也可以让 AI 玩家补上空位。这样一个人有空的时候，也能把一局开起来。

![游戏首页：建房或加入朋友的房间](/images/games/werewolf-ai/home.png)

建房时可以选 8 人、12 人或 15 人的板子，角色配置会跟着变化。进了游戏，核心还是我喜欢的狼人杀：听每个人怎么说，在发言和投票之间猜谁说的是真的。

![建房界面：选择人数和角色配置](/images/games/werewolf-ai/create-room.png)

如果要用 AI 玩家补位，目前需要自备兼容 OpenAI 接口的 API key；只和朋友玩则不用。[有空就来开一局](https://werewolf-ai-etn.pages.dev/)。
