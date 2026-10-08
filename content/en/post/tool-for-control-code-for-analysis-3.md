---
title: Tool for Control, Code for Analysis(3)
date: 2026-05-25 14:50:20
description: In one data-heavy agent task, large raw Tool responses strained context while a Code-only path took longer. We used a Context Off-Ramp to switch between the two paths.
categories:
  - AI Engineering
tags:
  - AI Systems
---
# **Tool for Control, Code for Data**

When Agent systems first started becoming popular, we implicitly assumed something:

If Tools became good enough, Agents would eventually turn into “brains that call APIs.”

Later we found that this assumption did not always hold in the data-heavy tasks we worked on.

When a Tool returns large amounts of raw data directly to the model, context pressure rises. Log analysis, RAG, monitoring, and digital twins can all encounter this problem. Whether they do depends on how the interface filters, paginates, or summarizes results, not simply on whether it is called a Tool.

A typical task looks like this:

“Find anomalies across the entire dataset and generate a report.”

The problem is not the reasoning complexity.

The problem is that the returned data becomes large enough to break the context system itself.

Later, on a real-world task involving around 10,000 entities, we compared three approaches:

- Pure Tool (standard MCP)
- Pure Code-as-MCP
- A dual-path execution model using both Tool and Code

In this implementation, sending raw Tool output into context became costly, while sending everything through Code added execution time. We ended up with a dual-path model:

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

But as returned data and execution steps grow, the costs can become difficult to manage.

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

This path could analyze the complete dataset, while the truncated Tool run could not. It also took longer in the comparison below.

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

Once context traffic becomes too large, the system redirects the data flow onto another execution path.

---

# **4. One Engineering Comparison**

We used a real task involving about 10,000 entities: screen the full dataset for anomalies and produce a PDF report. The figures below describe one run of each implementation. They are not a repeated, controlled benchmark. In particular, the pure Tool path truncated its data, while the other paths could process the complete dataset. Any difference in the result therefore cannot be attributed to the execution architecture alone. A Tool with server-side filtering, pagination, or aggregation would be another useful baseline.

## **Pure Tool**

This version took about 13 minutes, including about 11 minutes of Agent conversation and seven Tool calls. One full response approached 510,000 tokens. To avoid filling the context, we truncated the API result. The anomaly search was then working from incomplete data.

What this run shows directly is the cost of returning a huge raw result into the model's context and the loss of coverage after truncation.

## **Pure Code-as-MCP**

This version had access to the complete data, but took about 23 minutes and around 15 Tool calls. Some of that time went into fixing sandbox issues, dependencies, and generated code before the analysis could finish.

The extra execution work mattered most for small control actions that would otherwise have been a single validated Tool call. That does not make Code a poor fit for analysis; it shows the cost of sending every operation through the same flexible runtime.

## **Tool and Code with a Context Off-Ramp**

The dual-path version took about 4 minutes 30 seconds in this run. It kept small control operations as Tools and moved oversized data into the Code environment.

At step R2, `entities_keyword_search` produced a result estimated at 108,634 tokens. The orchestrator wrote the full result to CSV and returned a file pointer and a short preview instead of injecting the raw data into context. At R3, a refined result reached about 512,675 tokens and triggered the same switch. The Agent then spent about 3.5 minutes processing the data in a Python sandbox.

This run did not exhaust the context. The useful observation is that a file pointer kept large data available to the analysis path without asking the model to hold the whole dataset in conversation. The timing alone does not prove that this design is faster in every workload, and this comparison cannot establish an accuracy gain.

---

# **5. Where the Boundary May Help**

This experience came from a digital twin task. Other systems may have a similar split between small, high-risk control operations and large analytical workloads. In finance, for example, an order or risk-control action benefits from a narrow, validated interface, while a historical backtest may benefit from code operating on a dataset. In DevOps, changing a deployment and analyzing a large set of logs call for different execution controls.

The design rule we took from this run is narrower than “Tool is bad” or “Code is better”: keep state-changing actions explicit and validated, and avoid sending large raw datasets through the model's context when a bounded query or file-backed analysis path will do. Which boundary works best still depends on the task, available Tools, data volume, and acceptable latency.
