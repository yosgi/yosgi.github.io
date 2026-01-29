---
title: Understanding MCP (Tool-based) and Code-as-MCP Through a Layered Abstract Model
description: Using Anomalous Entity Filtering in Digital Twin Systems as an Example (2)
categories:
  - Technology
  - Ai
date: 2025-12-27 00:00:00
readingTime: 15
---

## 1. Background: Why an Abstract Model Is Needed


In interactive digital twin systems, a common class of tasks is filtering anomalous entities and highlighting them in the frontend. At first glance, this looks like a simple pipeline of “query + filter + UI operation”. However, as scene scale increases—across entity count, attribute volume, and system dynamism—differences between engineering approaches become amplified:

- Will latency explode?
- Where do failures occur, and how costly are they to recover from?
- Can a solution be transferred to other interactive scenarios?

To avoid discussions that rely solely on trial-and-error experience, I adopt a layered abstract model to describe and compare two paradigms:

- MCP (tool-based)
- Code-as-MCP (code execution / sandbox-based)

The goal is to explain where these differences come from under specific interaction constraints.


## 2. Structural Layer: The Minimal Skeleton of Interactive Systems


We begin by abstracting away implementation languages and frameworks, retaining only the concepts essential to interactive tasks:

- ($S_t$): the true world state at step (t) (backend data, frontend scene, permissions, caches, etc.)
- ($a_t)$: the action taken at step (t) (queries, filtering, UI control, etc.)
- ($\varepsilon_t)$: uncontrollable disturbances (concurrency, asynchrony, partial success, network jitter, pagination/rate limiting)
- ($O_t$): the observable feedback at step (t) (return values, acknowledgements, errors, summaries)

The two core relations governing an interactive system are:


$S_{t+1}=\delta(S_t,a_t,\varepsilon_t), \qquad O_{t+1}=h(S_{t+1})$


Their meaning is straightforward:

1. How the world evolves depends not only on what we do, but also on uncontrollable factors.
2. We can only observe a _projection_ of the state via the observation function ($h(\cdot)$) (returns, acknowledgements, errors), not the full state itself.

These relations imply a key structural fact:


As long as the next action depends on a new observation ($O_{t+1}$), the interaction process is inherently a multi-round closed loop—multi-round behavior is not an implementation choice, but a structural constraint.


## 3. Example: Why Anomalous Entity Filtering Is “Naturally Multi-Round”


Consider the task of filtering anomalous buildings and highlighting them, where the exact anomaly definition is not essential here—we focus on structure:

- Goal: identify a set of entities meeting certain conditions and highlight them in the frontend.
- Real-world constraints:
  - Schemas may be partially unstable (some entities lack fields).
  - Queries may be paginated, rate-limited, or partially successful.
  - Frontend execution may return partial failures, rejections, or non-operable entities.

A typical closed loop therefore looks like:

1. Probe or confirm schema and data availability (e.g., whether `height` exists and its coverage).
2. Conditionally query or filter based on probe results (filter only valid subsets).
3. Evaluate whether results are acceptable (should partial results be completed?).
4. Highlight entities in the frontend and read acknowledgements (possibly partial failures).
5. Apply remediation if necessary (completion, retry, or degradation).

This is not because “engineers failed to write a one-shot solution”, but because it is jointly determined by:

- ($\varepsilon_t$) (partial success, asynchrony, pagination, etc.)
- ($h(\cdot)$) (incomplete observability)

Together, these enforce a conditional information-acquisition process.


## 4. Action Layer: Key Differences Between MCP and Code-as-MCP


Once the structural layer is fixed, the two paradigms diverge primarily in **how actions are represented and validated**.


### 4.1 MCP (Tool-based)


Actions are drawn from a finite, enumerable set:


$a_t \in \mathcal{A}_{tool}$


Each action is constrained by a schema, with typical characteristics:

- Pre-execution validation: invalid parameters fail before execution.
- Errors are more structured.
- Lower per-action overhead.

### 4.2 Code-as-MCP (Code Execution)


Actions are expressed as “generate and execute a program”:


$\text{prog}t=\pi(O_t), \qquad (O{t+1}, S_{t+1})=\text{Exec}(\text{prog}_t, S_t)$


Key characteristics include:

- A _generative_ action space with strong expressive power (if/loop/search/aggregation).
- Errors are exposed at runtime rather than pre-execution.
- Higher per-action cost (generation + execution + parsing).

Both paradigms share the same structural interaction loop, but make different trade-offs in action representation and validation timing.


## 5. Cost Layer: Making “Slow, Expensive, and Fragile” Comparable


From an engineering decision perspective, we usually care about three classes of cost:

- Latency (user-perceived responsiveness)
- Token/context usage (scale, cost, context pressure)
- Failures and retries (repair cost, user visibility, stability)

A minimal cost model can be written as:


$C=\sum_t\Big(\lambda_L L_t+\lambda_T Tok_t+\lambda_F Fail_t\Big)$


Where:

- ($L_t$): end-to-end latency at step (t)
- ($Tok_t$): token consumption at step (t) (input/output/context accumulation)
- ($Fail_t$): failure cost at step (t) (binary, retry count, severity, etc.)
- ($\lambda$) are weights reflecting what the system prioritizes

### 5.1 Structural Parameters: Interaction Strength and Constraint Strength


These parameters determine the _lower bound on rounds_ and the _distribution of failures_, thereby influencing total cost indirectly.

- **Interaction strength** (minimum number of feedback rounds):

  $t \ge I$

- **Constraint strength** (schema stability and static validation capability), influencing expected failure:

  $\mathbb{E}[Fail_t]=f(K), \qquad \frac{d}{dK}\mathbb{E}[Fail_t]<0$


Thus, in systems with high interaction strength (I), multi-round costs are naturally amplified; in systems with high constraint strength (K), pre-execution validation becomes especially valuable.


## 6. Re-examining Both Paradigms in Digital Twin Systems


In the “anomalous entity filtering + frontend highlighting” task, digital twin systems typically exhibit:

- High (I): multiple feedback and acknowledgement rounds are required.
- Significant ($\varepsilon_t$): pagination, partial success, asynchrony, concurrency.
- Incomplete observability ($O_t$): only projections of the state are visible.
- Failures that demand fast, structured handling (experience- and stability-sensitive).

Under this structure:

- **MCP (tool-based)** advantages:
  - Pre-execution validation reduces failure costs.
  - Lower per-action overhead, suitable for high-frequency interaction.
- **Code-as-MCP** advantages:
  - Strong expressiveness for large-scale filtering and aggregation.
  - Ability to externalize heavy computation, reducing context pressure.

The two approaches are not mutually exclusive; under the same interaction structure, they represent different trade-offs between action expressiveness and validation timing.In high-frequency, strongly constrained scenarios, tool-based actions better control latency and failure cost.


In compute-heavy, low-interaction sub-tasks with compressible outputs (top-k / aggregates), code execution is more effective.


## 7. Transfer Conditions: Where This Analysis Applies


This layered model applies to systems with the following characteristics:

- Open state (externally mutable)
- Feedback-driven decision loops
- Irreducible multi-round interaction
- Trade-offs between action expressiveness and validation timing

When applying this analysis to other domains (e.g., data analysis, batch processing, offline retrieval), changes in structural parameters ((I, K, $\varepsilon$)) may reverse cost conclusions.


## 8. Summary


By separating structural, action, and cost layers, this article compares MCP (tool-based) and Code-as-MCP within a unified abstract framework. Key takeaways include:

1. Multi-round interaction often arises from structural constraints, not implementation quality.
2. The core difference between paradigms lies in action representation and validation timing.
3. Cost functions accumulate per-round cost, while structural parameters determine how costs grow.
4. In typical digital twin interaction tasks, the two paradigms should be viewed as complementary rather than mutually exclusive.

[In the next post](https://yosgi.github.io/en/post/structural-necessity-of-hybrid-ai-architectures-in-digital-twin-systems/), I will continue by documenting an attempt at a hybrid architecture—one that preserves the advantages of MCP-as-Code while bringing latency and failure costs back into a practical range.
