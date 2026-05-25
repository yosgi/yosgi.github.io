---
title: Tool for Control, Code for Analysis(3)
description: In large-scale Agent systems, pure Tool-based approaches tend to collapse under context pressure, while pure Code-based approaches introduce excessive latency. Based on real-world experiments, this article introduces a dual-path execution model that uses a “Context Off-Ramp” to switch between Tool and Code execution.
categories:
  - Technology
  - Ai
date: 2026-01-28 00:00:00
readingTime: 16
---
# **Tool for Control, Code for Data**

When Agent systems first started becoming popular, we implicitly assumed something:

If Tools became good enough, Agents would eventually turn into “brains that call APIs.”

Later we realized this assumption only holds at small scale.

Once the amount of data keeps increasing — especially in environments like log analysis, RAG, monitoring systems, and digital twins — pure Tool-based systems start running into very obvious problems.

A typical task looks like this:

“Find anomalies across the entire dataset and generate a report.”

The problem is not the reasoning complexity.

The problem is that the returned data becomes large enough to break the context system itself.

Later, on a real-world task involving around 10,000 entities, we compared three approaches:

- Pure Tool (standard MCP)
- Pure Code-as-MCP
- A dual-path execution model using both Tool and Code

The results were very straightforward.

Pure Tool systems eventually get dragged down by context.

Pure Code systems are more accurate, but latency grows very quickly.

The only thing that stayed stable was a dual-path execution model:

- Tool handles the control plane
- Code handles the data plane
- A small “Context Off-Ramp” switches between them

This article is mainly about why this structure emerged, and how we eventually got it working reliably.

---

# **1. Why Pure Tool and Pure Code Both Start Breaking Down**

In the previous article, we already separated MCP (Tool-based execution) and Code-as-MCP along two dimensions:

- how actions are represented
- when validation happens

At small scale, these differences barely matter.

But once system complexity keeps increasing, the problems start appearing in very non-linear ways.

Eventually we kept running into two recurring “cost cliffs.”

---

## **The Tool Problem: Context Starts Maintaining Itself**

At first we strongly preferred Tools.

They naturally fit things like:

- schema validation
- permission control
- UI operations
- state mutation
- auditable actions

A lot of operations should obviously be Tools:

- deleting objects
- modifying state
- scaling down deployments
- executing trades

Giving those operations to free-form generated code significantly increases risk.

The problem is that most Tool systems implicitly assume the returned data will stay relatively small.

In production environments, that assumption breaks very quickly.

For example:

“List all anomalous entities in the current dataset.”

The task itself is not complicated.

The real problem is that it may return thousands or tens of thousands of records at once.

Once those results are serialized directly into context, things start falling apart very quickly.

In one experiment we saw a single Tool response exceed 500K tokens.

The real problem was not cost.

The Agent itself started entering a very strange state:

- response times became noticeably slower
- tool loops increased
- prompt constraints started fading
- the original task drifted
- later data started overriding earlier goals

At some point, the system was no longer “thinking about the task.”

It was trying to maintain the context itself.

This became one of the clearest behaviors we observed.

Tools were originally designed for precise control.

But in high-data environments, they gradually become the primary source of context pressure.

---

## **The Code Problem: Most Time Goes Into “Getting the Code to Run”**

Later we tried the opposite extreme.

If Tools explode the context window, should everything just become code execution?

That did not work particularly well either.

A lot of tasks are fundamentally atomic operations.

For example:

“Select object #42.”

That operation is really just a deterministic state mutation.

But if the Agent has to:

- generate code
- call the sandbox
- execute it
- inspect results
- fix failures

the entire system starts paying additional cost for flexibility.

And much of that cost has very little to do with the actual business logic.

In pure Code systems we repeatedly saw problems like:

- code generation itself taking too long
- dependency issues increasing
- sandbox debugging loops growing
- Agents generating complex logic for tiny operations

Accuracy improved significantly.

But latency also increased significantly.

A surprising amount of time was spent simply getting the code to run successfully.

This is one of the most common problems with pure Code Agents.

They are extremely flexible.

But many operations that should have been a single Tool call end up expanding into an entire execution chain.

---

# **2. Eventually We Split the Execution Paths**

Over time we realized something:

control tasks and analysis tasks fundamentally do not belong to the same execution model.

Eventually the system split into two paths.

---

## **The Tool Control Path**

One path became responsible for:

- UI operations
- state mutation
- single-entity queries
- small responses
- high-risk actions

The goal here is very simple:

fast, deterministic, and verifiable.

So this layer keeps:

- strong schemas
- strict validation
- limited callable operations

At its core, it behaves much closer to a traditional software system.

The only difference is that the caller is now an Agent.

---

## **The Code Analysis Path**

The second path became responsible for:

- aggregation
- batch computation
- large-scale anomaly detection
- visualization
- multi-step analysis

Here we intentionally relaxed some constraints.

Because these tasks primarily need the ability to process complex data.

The code runs directly inside a sandbox environment.

It operates on files, DataFrames, and raw datasets.

Not the chat context window.

That turns out to be a very important shift.

Once the data enters the code environment, the Agent no longer needs to “remember everything.”

The context layer becomes a control layer again.

Instead of continuing to act as the data plane.

---

# **3. The Critical Piece: Context Off-Ramp**

The thing that actually stabilized the system was not the dual-path model itself.

It was deciding when to force the switch.

The orchestrator continuously monitors the size of Tool responses.

Once a response approaches the token threshold, the system stops injecting the raw JSON into context.

Instead it does four things:

1. stop context injection
2. write the data into CSV / Parquet
3. return a file path and lightweight summary information
4. force the Agent onto the Code path

The important part is this:

this is not an optimization.

It is a forced execution switch.

At that point the Agent can no longer continue processing through the Tool path.

It must move into the code environment.

Internally we eventually started calling this mechanism:

Context Off-Ramp

Because it behaves very similarly to a highway off-ramp.

Once context traffic becomes too large, the system forcibly redirects the data flow onto another execution path.