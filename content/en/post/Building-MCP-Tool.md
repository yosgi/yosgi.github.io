---
title: Building MCP Tool
description: How  Cut 6,000 Tokens Down to 500
categories:
  - uncategorized
date: 2025-10-28 00:00:00
summary: 
---





When building MCP , one of the biggest challenges we faced was token consumption. Our initial setup was incredibly heavy — before the model even said a single word, we were already using thousands of tokens.

Here’s what that looked like:

- System prompt: ~2,000 tokens
- Tools (42 total): ~4,000 tokens (including both the Digital Twin tools and the Navigator tools)
- Total baseline: ~6,000 tokens before any conversation even began
And as many developers know, the more tokens you pack into a single context, the “dumber” the AI becomes — slower responses, higher cost, and less accuracy.

**Step 1. Dynamic Tool Loading with Embeddings**

To solve this, we stopped loading all 42 tools by default.

Instead, we built an embedding-based tool retriever, so MCP only imports the tools dynamically when needed. This reduced the default load dramatically.

**Step 2. Tool Registry and Discovery**

We introduced a Tool Registry with two simple meta-tools:

- discover_tool: lists available tools by name and short description
- describe_tool: returns the detailed schema, I/O, and examples for one tool
This let the model “discover” tools on demand instead of holding all tool definitions in memory all the time.

**Step 3. Collapsing Tools into Unified Interfaces**

We also realized that many tools did almost the same thing. So:

- All database-related tools (like entity_query, entity_phrase_query, entity_attribute_filter) were collapsed into a single DSL-style query tool called digital_twin.query.
- All user interface tools (for handling the Navigator) were merged into a single tool called navigator.patch.
This simplification alone removed hundreds of tokens and reduced cognitive load for both the model and developers.

**Step 4. Managing Context and Token Budgets**

We enforced a token budget per conversation:

- Keep only the first 4 and last 4 messages in full.
- When the conversation exceeds 6,000 tokens, automatically summarize the middle part.
We also shortened and standardized tool documentation, using clean, regularized one-line formats rather than verbose JSON schemas or lengthy examples.

**Step 5. Planner–Executor Separation**

To simplify reasoning, we split MCP into:

- A lightweight planner (small prompt, under 300 tokens) that produces macro actions.
- An executor that loads the relevant tool specs and executes the actions.
This separation further cut down prompt size and improved clarity.

**Step 6. Results: Faster, Cheaper, Smarter**

After all these optimizations:

- Tool tokens reduced: from ~6,000 → ~500
- System tokens reduced: from ~1,000 → ~400
- The model became faster, cheaper, and most importantly, more accurate.
**Bonus: The “Format Imitation” Phenomenon**

One fascinating observation during this process:

The AI tends to mimic the formats you give it.

If you send a JSON example, it will keep replying in JSON.

If you use dot notation (config.value.max), it will consistently follow that style in later turns.

This subtle “format anchoring” effect helped us achieve higher consistency and smoother tool usage across conversations — almost like teaching the model your coding style.

**Final Thoughts**

Optimizing token usage isn’t just about saving compute — it’s about clarity, responsiveness, and reliability.

By dynamically loading tools, simplifying interfaces, and enforcing token budgets, we turned MCP2 from a sluggish prototype into a lean, responsive system that actually feels intelligent.



