---
title: "[DevLog #01] For the Sake of Cloud Cat-Raising, I Decided to Build a Web
  Mini Game from Scratch（day 1"
description: Build a Web Mini Game from Scratch
categories:
  - Technology
date: 2025-12-11 00:00:00
---

## 1. Introduction: Why Start This Project?


As a developer, I’ve always had a small obsession:


**I want to make a game that truly belongs to me.**


Not for commercialization, and not to build something overly complex—


I just want to combine _writing code_ with _something fun_.


That’s how this idea came up:


**A cozy, healing-style cat-raising Web mini game.**

- Casual
- Relaxing
- Open the browser and “raise a cat in the cloud”

Of course, ideals are beautiful—but reality is often less so.


---


### Challenge #1: Limited Art Resources

- I can’t draw
- No budget to hire an artist

So the solution is simple and straightforward:


**Use high-quality free 2D pixel art assets from the internet.**


The main sources I currently use include:

- Itch.io

They’re free, stable in quality, and perfect for beginner projects.


---


### Challenge #2: Limited Development Resources

- I’m working solo
- Time and energy are limited

For the tech stack, I chose **Cocos Creator**.


Main reasons:

- **Very friendly to TypeScript**
- One-click publishing to **Web / iOS / Android**
- Mature engine with a solid ecosystem
- Strong support for 2D games

Between _features_ and _complexity_, Cocos offers a very balanced choice.


---


## 2. Step One: Laying the Foundation of the Game World — The Map


Before writing any gameplay logic, the first thing I focused on was:


**Building the foundation of the game world.**


The core tool used here is:


> Tiled Map Editor


---


### What Is a Tilemap?


Simply put:

- Use many small tiles
- Assemble them like a puzzle
- To create a large game world

The advantages are very clear:

- High asset reuse
- Low cost for map modifications
- Performance-friendly
- Perfect for 2D games

For beginners, Tilemaps are almost a default choice.


---


## 3. Map Layering (Layering Strategy)


I split my map into **three layers**.


The goal isn’t just cleaner structure—


more importantly, it’s **rendering performance optimization**.


---


### Layer 1 & Layer 2: Base Terrain Layers


**Content:**

- Grass
- Sand / Ground

### Why split base terrain into two layers?


**1️⃣ Editing Convenience**

- Easier handling of transitions between different terrains
- Brushes don’t interfere with each other
- Lower modification cost

**2️⃣ Rendering Optimization (Draw Calls & Culling)**

- Large, purely static terrain works well as separate layers
- In Cocos, this allows better use of **culling**
  - Off-screen terrain doesn’t need to be rendered
- Static background layers can be **batched by the engine**
  - Significantly reduces draw calls
  - Lowers rendering pressure on Web platforms

---


### Layer 3: Decoration / Obstacle Layer


**Content:**

- Mushrooms
- Rocks
- Trees and other decorations

**The key purpose of this layer:**

- These objects often have **occlusion relationships**
- Or require **collision volumes** later on

Separating them provides two clear benefits:

- Easy to uniformly add

  `Collider / RigidBody`


  components in Cocos later

- No need to pollute complex terrain layers with logic concerns

Terrain handles the “ground,”


decorations handle the “objects”—


clear responsibilities, clean structure.


---


## 4. Practical Workflow


This stage is mostly manual work, but it’s surprisingly relaxing.


### 1️⃣ Import Assets

- Download pixel-art tilesets
- Import them into Tiled
- Ensure consistent tile sizes (e.g. 16×16 or 32×32)

### 2️⃣ Paint the Base Terrain

- Fill the background with grass first
- Use sand/ground to draw paths or specific areas

### 3️⃣ Add Decorations

- Switch to Layer 3
- Place rocks and mushrooms
- Make the map feel less empty

### 4️⃣ Import into Cocos Creator

- Drag the generated `.tmx` file directly into Cocos
- Preview the result in the editor
- Verify layers and rendering behavior

Seeing the map appear correctly in the engine is genuinely satisfying.


![](https://prod-files-secure.s3.us-west-2.amazonaws.com/4ebc926d-a5ea-4392-a4ae-a936f72673cd/1dde2521-b751-432b-bb0e-94dd8c044b19/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466S4OZFRZE%2F20260129%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260129T043526Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCYu8BNIerH%2FJoRC3GdP0sjH6zzjtbUHmOsbSnxXJoxwAIgWX7g08xa2cEmLvURnXVyG1v23KKV60%2FZAZPTRbElIWMq%2FwMIfRAAGgw2Mzc0MjMxODM4MDUiDCxeaX0%2FbrsPOrNYzCrcA2ROOkAH7dzZrGTS%2BTgkiLthNvaNw6KQStDN7CMUOho1UXFwdKxpj6JFS4rsSdwngCxpyd8hcFCZSpgydTSuFUxeYhLfXb%2BvU2vHRpakQJ4N5PgJ%2BheufQivjiIujT8uJ48YVlNuwsjKIXfw9HSwuMpD2PMCjlzjh7PzlwLoKfw0Sj1sXrqb2k%2BirdQ39dbOiqD3wdeM0pSuXXzdvhkPBRhGmWosZvh%2B3Bw3iCM5PEerjFnZONHY%2BWRq003VV2czazXBI50NaTHThzFZ271pN4LsvenyMtaY6iIkgb9COHH4p37NgwBGNSVN3HEp01NI%2FiYHjfKd9UiHboNPDfK2ws8XYqtbYlxbLi0UpqRvSZMDkG35Gr0S70mRU7Kp08xjU%2Bw0E1y%2BYWmUeSDGIFlhDgFM%2Bpo%2BBCw%2FxmPdoEaNMPjgkJRIbIDFhzlivv6T1LOdqGtS7UG%2FqGXzNm8WHqyKrqKVSeouBEb4Y7m%2BUqiZFJp2DLqUTlRB0wbtE9RwaFF%2BXCdMl5cDIDcwMDhk4AgDSTfFxwtmwO1KFaK%2FZ7QkBTBDZRTjJx8QKhngElmbpaQmprL9c8k5FlZZ%2F2OzxB%2Bu7RwsrgFo6%2ForzuKduIKLMrZ3Gy8uFQ%2Fg2u%2Fjq9cwMNqo68sGOqUBe%2Bs%2F7ggiwY5C%2BuI%2BLqZQTovSM77jhVV3PoE7TIZLDT10pNKDcCzVFBLcHnIUwdwM%2B3IxeWUoJehkp0vm%2B4L%2BTydId1kYp3P%2F%2Bi6JoBlaMedVYzZyS5QGeOPqkrix7XNum0IMfJFEgY5FarMSo%2Baz%2BrqrT8RxNdr2IWhHmaPpv%2ByG5gth%2FfEbW6l2voj5uUiiiuH6NNvPsxZ7Iav3d8HADivjoJq9&X-Amz-Signature=65b77e81694b1388cfb83fe035e96ea01fddd732ef9c90fac4c52e2784f2f298&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


---


## 5. Summary & Next Steps


At the moment, this project is still at a **very early stage**:

- Map structure is finalized
- Layering strategy is validated
- Assets and workflow are running smoothly

Next steps include:

- Adding the cat character
- Implementing basic behavior logic
- Simple interactions (clicking, feeding, etc.)

This DevLog series will aim to stay:

- Beginner-oriented
- Honest about mistakes and pitfalls
- Step-by-step and realistic

If you’re also interested in game development—or working solo with limited resources—there’s no need to put too much pressure on yourself.


**Break the project into small pieces and move forward slowly.That alone already puts you ahead of many “idea-only” projects.**
