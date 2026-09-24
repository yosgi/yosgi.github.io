---
title: "I Made a Small 3D Game with AI"
date: 2026-09-24 00:00:00
description: "I used AI, Blender, and Three.js to turn a photograph into a little Hobbit village you can walk through."
categories:
  - Projects
tags:
  - AI
  - Game Development
  - Three.js
draft: false
translationKey: our-little-shire-game-dev
---

[You can play the game here.](https://shire.siqi-liu.com/)

I had never made a complete 3D game before. *Our Little Shire* began with a fairly simple idea: I wanted to turn a photograph that matters to me into a place I could walk through. It showed a little Hobbit village house, a red door, a stone path, and flowers. I wanted the girl in the game to follow that path to the door.

The first version came together faster than I expected. What surprised me was how much more time I spent afterwards trying to make it look and feel like the place I had in mind than I spent getting it to run.

I used the photo as a reference for AI, then adjusted the village model in Blender. Some character models I found; others I generated with Meshy and worked on afterwards. I put the scene in the browser with Three.js and added interactions one by one: cleaning an old ring, talking to a guide, solving a nine-tile puzzle on a table, feeding the cows and sheep, and playing fetch with a little dog. Eventually, ending the game at the main story felt like a waste of the village, so I added small things you can come back and do with its people and animals.

The thing I said most often during development was probably not a technical term. It was “this doesn't look right.” The dog would jitter up and down while running over a wooden board. After fetching the ball, it carried the ball at its neck. One of the boy's legs bent too much when he walked, and the girl swayed from side to side like a robot. AI could inspect the models, bones, ground height, and animation code, then make changes. But I usually had to walk through the game myself to notice these problems, and one fix was rarely the end of it.

At one point I also had several preview tabs open, all playing the music at once. The audio stuttered and turned into a mess. That probably wouldn't make it into a “make a game with one prompt” demo, but it was part of making this game.

I think about AI lowering the barrier to game development differently now. It hasn't made the work thoughtless. It has let me work on parts I might not have touched before. In the past, a problem with character rigging, a Blender script, or deployment might have stopped the project while I spent a long time learning the basics. Now I can give AI a specific problem, get a working change, and return to the game to decide whether it actually feels right.

There are still rough edges. I haven't counted the hours or the prompts, because this took many rounds of playing and changing things. What makes me happy is that I can send someone a link and let them walk into that village. As a developer who might otherwise have left this idea on a list, that feels like a big change.
