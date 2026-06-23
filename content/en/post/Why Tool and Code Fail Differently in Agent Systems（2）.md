---
title: Why Tool and Code Fail Differently in Agent Systems（2）
description: Tool and Code do not just differ in expressiveness; they also fail at different times. This article explains why multi-round Agent systems amplify that difference.
categories:
  - AI Engineering
tags:
  - AI Systems
  - AI Agents
date: 2026-05-25 14:50:20
---
In the previous article, I wrote about an MCP-as-Code refactor.

It did reduce some of the context pressure, but it also exposed a more subtle problem: code execution changes where failures happen.

In an interactive Agent system, that matters a lot.

Let me first clarify what I mean by an “interactive Agent system.”

This is not a chatbot that only generates text.

It actually operates a system: it calls backend Tools, reads the returned results, and then controls the frontend scene.

After each step, the system returns some form of feedback, such as query results, error messages, frontend acknowledgements, or cases where some objects succeed and others fail.

In the rest of this article, I will refer to these as “feedback.”

That is why this article keeps coming back to one question: why the next action often depends on the feedback from the previous step.

This article is mainly about that boundary: why Tool and Code are not just two ways of expressing the same kind of action, and why some Agent systems naturally become multi-round.

---

# **Some Agent Tasks Cannot Reliably Be Done in One Step**

A common task in my system was:

Find anomalous entities and highlight them in the frontend.

At first glance, this looks like a simple flow.

Query the data.

Filter the entities.

Send a UI command.

Done.

But real interactive systems are usually not that clean.

A more realistic flow looks like this:

1. First, check whether the required fields exist.
2. Check whether the data coverage is good enough.
3. Filter only the valid subset.
4. Handle pagination, or cases where only part of the data is returned.
5. Send the highlight command to the frontend.
6. Read the frontend acknowledgement to see whether the action succeeded.
7. If only some objects succeeded, retry or degrade.

The important part is that each step depends on what came back from the previous one.

If the field does not exist, the next query changes.

If the data is incomplete, the filtering logic changes.

If the frontend rejects part of the operation, the recovery path changes.

So many Agent tasks cannot be reliably compressed into a single call.

Multi-round behavior does not always mean the Agent is not smart enough.

Sometimes the system itself requires a feedback loop.

The Agent does not know the full system state.

It can only see the feedback after each step.

As long as the next action depends on that feedback, the runtime naturally becomes multi-round.

---

# **Tool and Code Fail at Different Times**

Once I started looking at the system from this angle, the difference between Tool and Code became clearer.

They do not just differ in expressiveness.

The more important question is when the system can reject a bad action.

Tool-based execution usually has a limited set of actions.

Each Tool has a schema.

The parameters are already known before execution.

Many errors can be caught early: wrong types, missing fields, invalid enum values, insufficient permissions.

The failure happens before the real execution.

That makes the failure relatively cheap.

The Agent receives a structured error and can usually adjust the parameters or choose another Tool.

This is why Tool is still a very good fit for control operations.

Changing UI state.

Selecting an object.

Hiding a layer.

Updating a known field.

Triggering a backend operation with clear boundaries.

These actions need to be narrow.

Narrowness is not a weakness.

It is what makes them safe, stable, and predictable.

Code execution is different.

The action is no longer selected from a small set.

The Agent generates a program.

That program can contain loops, branches, search, aggregation, retries, and intermediate state.

This gives Code much more expressive power.

For large-scale filtering, statistics, batch processing, or anything that needs to traverse a dataset, this is exactly the capability you want.

But many errors only appear after the program actually starts running.

A field does not exist.

A type is different from what the model expected.

An API response has a slightly different shape.

A dependency is unavailable.

A frontend operation only partially succeeds.

At that point, the system has already entered runtime execution.

The Agent needs to read the error, understand it, rewrite the code, and run it again.

That is a completely different failure model.

---

# **Multi-Round Systems Amplify Small Costs**

In a one-shot task, a small failure is just a small failure.

In a multi-round system, the same cost starts to stack.

Each extra round can add:

- latency
- token usage
- context pressure
- retry cost
- another chance for the system state to change

This is why a design that looks acceptable in isolation can become expensive once it is placed inside an interaction loop.

A generated piece of code may only take a few seconds.

A result summary may only add a few hundred tokens.

A retry may not look serious.

But if the task itself requires five or six rounds of feedback, these small costs accumulate quickly.

This is what I underestimated in my first MCP-as-Code refactor.

---

# **Back to Anomalous Entity Filtering**

In anomalous entity filtering, this difference became very clear.

The data side wanted Code.

There could be thousands or tens of thousands of entities.

The schema might not be fully stable.

Some fields might be missing.

Some filters required aggregation or derived calculations.

Putting all of that into the LLM context was not a good option.

Code was the more natural execution environment.

Files, DataFrames, loops, filters, and statistics belong there.

But the control side still wanted Tool.

Once the target set is known, the frontend operation needs to be fast, bounded, and verifiable.

Highlight these objects.

Hide this layer.

Move the camera.

Apply this style.

If a schema-validated Tool can complete these actions directly, there is no need to generate a script.

The real boundary is not MCP versus Code-as-MCP.

It is between two kinds of work.

One is data processing.

The other is control.

Data processing fits Code better.

Control fits Tool better.

If both are forced into the same execution path, the cost starts to show.

---

# **Validation Timing Became the Real Boundary**

Over time, I found validation timing to be the more useful lens.

Tool-based execution is more likely to fail before execution.

Code-based execution is more likely to fail during runtime.

That difference changes the whole cost structure.

Pre-execution failure is usually cheaper.

Runtime failure is usually more expensive.

Not because runtime failure is always bad.

But because recovery requires another loop.

The Agent needs to inspect what happened.

The system needs to preserve enough context for recovery.

The next action may need to change.

In a high-interaction system, this recovery loop is the real cost.

This is also why Code works well for low-interaction analysis tasks.

If the task mostly happens inside the dataset, Code can run, fail, recover, and summarize inside the analysis path.

The user does not need to see every intermediate step.

The frontend does not need to acknowledge every operation.

The final output can be compressed.

But if the task is tightly coupled with UI state, permissions, partial frontend execution, and user-visible actions, late failure becomes very expensive.

---

# **This Is Why Expressiveness Alone Is Not Enough**

After the MCP-as-Code refactor, I increasingly felt that comparing Tool and Code only by expressiveness is not enough.

Code can express more complex logic.

But it also pushes many errors into runtime.

Tool is narrower in what it can express.

But it can catch more problems before execution.

If a system is naturally multi-round, this difference keeps getting amplified.

So the real comparison is not:

which approach is more powerful.

It is:

when should failures happen for this task?

This is the question the next article will continue to explore: if Tool and Code fit different kinds of tasks, when should the runtime move the Agent from one path to another?

---

# **Closing**

The most useful lesson from this part of the work was simple:

some Agent systems are multi-round because the system itself is multi-round.

The Agent can only see partial feedback.

The system keeps changing between actions.

Frontend operations may only partially succeed.

Backend results may be incomplete.

Schemas may drift.

Once those conditions exist, when a failure happens becomes just as important as what an action can express.

Tool and Code are both useful.

But they fail differently.

And in a high-interaction Agent system, where they fail often matters more than what they can express.

The next article will continue with the switching problem.