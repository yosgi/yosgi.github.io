---
title: An MCP-as-Code Refactor, and Why It Did Not Work the Way I Expected
date: 2026-05-25 14:50:20
description: A real-world MCP-as-Code refactor on where Code helps, where Tool still fits better, and why Agent runtime needs both.
categories:
  - AI Engineering
tags:
  - AI Systems
  - MCP
---
When I first started building this system, I had a very direct goal:

let the LLM understand the current scene, then perform actions based on the user’s instruction.

The user says something.

The Agent queries the data, finds the target, and controls the frontend.

But as the scene size kept growing, I slowly realized that the problem was not whether the Agent could call tools.

The problem was that it should not be seeing that much data in the first place.

In the digital twin system I work on, a typical scene can contain tens of thousands of entities.

Each entity also carries a large amount of data: status, metrics, business fields, frontend state, and real-time values.

The part that is easy to underestimate is that, in many cases, even the IDs alone are enough to put pressure on the context window.

For example, in some scenes, there may be tens of thousands of buildings.

Simply passing the complete list of building IDs to the LLM for later filtering or control already consumes a surprising number of tokens.

That is before attaching thousands of tokens of attribute data behind each building.

Over time, one thing became increasingly clear:

any approach that tries to put the full scene data directly into the LLM context and then asks the model to make decisions does not scale.

That is why I started experimenting with MCP-as-Code.

---

# **The Initial Tool Model Was Very Direct**

Before the refactor, I used a fairly direct MCP Tool-based approach.

The system exposed two types of Tools to the model.

One type queried scene data.

The other controlled the 3D scene, such as coloring, hiding, transforming, or locating objects.

The LLM acted more like a controller.

It selected a Tool based on the user’s instruction, read the result, then called the next Tool.

For example, if the user said:

Color all buildings red.

The most direct execution path was:

1. Call a Tool to query all building IDs.
2. Call another Tool to color those IDs.

The advantage of this model was very clear.

It was fast.

It was stable.

Issues like parameter types, schema validation, and permissions could usually be caught by code validation before the actual execution happened.

For UI operations, state changes, and single-entity queries, this model worked quite well.

The problem was that it assumed one thing:

Tool responses would not be too large.

In real scenes, that assumption broke very quickly.

---

# **The Real Problem Was Not Fetching Data, but Putting It Into Context**

At first, I was focused on this question:

can the API fetch enough complete data?

Later I realized that was the wrong question.

At this scale, the more important question is:

where should the fetched data go?

If a Tool returns thousands or tens of thousands of entities directly to the LLM, the system quickly enters a strange state.

The model is no longer really analyzing the task.

It is trying to maintain the context.

A large number of tokens are used to carry raw data instead of supporting reasoning, decision-making, or control.

What the LLM actually needs is not “all the data.”

It needs a way to process the data.

It needs logic for filtering, aggregation, statistics, and result extraction.

It should not be forced to swallow every entity and then do filtering inside the context window.

This was the part of MCP-as-Code that attracted me the most.

It shifts the model from being a Tool selector toward being a logic writer.

The model is no longer just choosing an API.

It starts writing processing logic.

---

# **Anthropic’s MCP-as-Code Looked Like the Right Fit**

Later, I read Anthropic’s article, _Code Execution with MCP_.

The idea was simple, but it hit exactly the problem I was facing.

Do not expose every MCP Tool to the model directly as JSON Schema.

Treat the MCP Server as a set of APIs that code can call.

Then let the model generate Python or TypeScript and run it inside a controlled sandbox.

The model only needs to see a summary of the execution result.

For large datasets, the model does not need to see ten thousand raw rows.

It only needs to see a few sample rows, statistics, or the small set of final targets.

This matched my context problem almost perfectly.

So my expectation for the refactor was very clear:

large-scale filtering, aggregation, and statistics would run in the background.

The LLM would only see the result.

Context pressure would go down.

The model would move from “Tool selector” to “logic writer.”

From a design perspective, this felt like a very natural path.

---

# **What I Actually Built Was Java + Python Sandbox**

Because the existing system already had a Java core service, I did not rebuild everything from scratch.

I added a Python Sandbox layer.

The Java layer continued to handle:

- session management
- authentication
- API calls
- scene data pre-filtering
- frontend communication
- result parsing

For example, before the actual processing started, Java would first confirm which IDs currently existed in the frontend scene and filter out data that was not present in the scene.

The Python Sandbox was responsible for executing code generated by the LLM.

It communicated with Java over HTTP.

The generated code could call MCP APIs or control the frontend through WebSocket.

After execution, it returned `stdout`, `result`, `ui_events`, and `errors`.

From an execution model perspective, the LLM was no longer directly calling Tools.

It entered a different loop:

write code → execute → read result → write more code

This is where the later problems started to appear.

Because I initially imagined that one script could complete multiple steps.

But real interactive systems do not run that way.

---

# **Then the Scripts Kept Getting Interrupted**

My initial assumption was:

let the LLM generate one Python script that combines multiple Tool calls.

Query, filter, aggregate, and control the frontend as much as possible in one execution.

In theory, this should reduce context pressure and reduce the number of interaction rounds.

But once the system actually ran, this assumption broke quickly.

A typical flow ended up looking like this:

1. The LLM generates a Python script to query or filter building IDs.
2. Java / Python executes it and returns the result to the LLM.
3. The LLM reads the result and decides the next step.
4. The LLM generates a second Python script to control the frontend through WebSocket.
5. The frontend executes the operation.
6. The frontend returns the execution result.
7. The LLM decides whether it needs to recover or continue.

In other words, the script often only completed one small step before it had to stop and wait for the next round of feedback.

This was not because the script was poorly written.

It was because interactive systems keep producing new state.

Did the frontend actually execute the action?

Which objects failed?

Do these IDs still exist in the current scene?

Did permissions, pagination, or asynchronous results change?

All of these require another round of feedback.

So the original idea of “one script completing multi-step logic” eventually degraded into multiple serial round trips.

The latency impact was very obvious.

---

# **Simple Operations Became Slower**

The clearest example was still:

Color all buildings red.

In the original MCP Tool mode, this kind of operation took around 2 seconds on average.

In the MCP-as-Code mode, it often took more than 10 seconds.

Not because Python itself was slow.

The real cost came from the entire execution chain:

- the LLM generates code
- Java forwards the request
- the Python Sandbox executes it
- Java parses `stdout`, `result`, and `errors`
- the LLM reads the result and decides the next step
- the LLM generates the next piece of code
- the frontend executes the action
- the result comes back

Each step made sense on its own.

Together, they amplified the latency of a simple operation.

This was one of the first problems exposed by the refactor.

MCP-as-Code did reduce part of the context pressure.

But it also placed some originally short interactions into a much longer execution chain.

---

# **Failures Started Happening Later**

Another clear change was where failures happened.

In the original MCP Tool mode, many errors happened before execution.

The Java side had a JSON Schema Validator.

Wrong parameter types, missing fields, insufficient permissions — many of these could be rejected before the actual operation ran.

These failures were usually cheap.

The Agent received a structured error.

It could adjust the parameters or choose another Tool.

But once the Python Sandbox was introduced, many errors became runtime errors.

The code had already been generated.

The sandbox had already started.

The script had already begun running.

Only then did it discover that a field did not exist, a type was wrong, an API response had a different structure than expected, or a dependency was unavailable.

At that point, what the LLM often received was an entire stack trace.

The Agent then had to:

read the error.

understand the error.

rewrite the code.

execute again.

If the next run hit another runtime issue, the loop continued.

This does not mean MCP-as-Code is bad.

It simply made one thing very clear to me:

MCP-as-Code does not only move data processing from context into a sandbox.

It also changes where failures happen.

---

# **What This Refactor Actually Exposed**

This experiment solved a real problem.

The LLM should not swallow the full scene data.

For large-scale filtering, aggregation, and statistics, it is more reasonable to keep the data inside the code environment and let the model only see the summary.

But it also exposed another problem.

When the task is not offline analysis, but a high-frequency, interactive, strongly constrained system operation, code execution introduces new costs.

Something that used to be one Tool call can turn into:

generate code.

execute code.

read the result.

fix the code.

execute again.

control the frontend.

read the result.

Context pressure goes down.

But latency, retries, and runtime failure cost start going up.

This was what I underestimated at first.

I originally thought MCP-as-Code simply moved data processing from the context into the sandbox.

Later I realized it also changed the execution path.

More precisely:

it changed where failures happened.

In the original Tool mode, many errors could be caught before execution.

In the Code mode, many errors only appeared after the program actually started running.

That problem deserves to be unpacked on its own.

---

# **Closing**

The biggest value of this MCP-as-Code refactor was not that it solved every problem directly.

It helped me see a boundary more clearly.

The LLM should not swallow the entire scene.

But not everything should be pushed into code execution either.

For large-scale data processing, Code is the more natural environment.

For real-time control and strongly constrained operations, Tool still has strong advantages.

The real questions became:

why do these two approaches create such different failure costs?

And why does this difference keep getting amplified in a multi-round Agent system?

The next article defines that problem first:

Tool and Code do not just differ in expressiveness.

They also fail at different times.

---

## **References**

- Anthropic Engineering: Code Execution with MCP  
    https://www.anthropic.com/engineering/code-execution-with-mcp
- Model Context Protocol documentation  
    https://modelcontextprotocol.io/