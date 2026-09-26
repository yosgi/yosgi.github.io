---
title: "From Writing Code to Leading Agents: Why My Work Is Starting to Feel Like a CTO's"
date: 2026-09-26T12:00:00+12:00
description: "Working across two tech startups, I use Codex to coordinate and Claude to implement, while focusing more of my own attention on direction, judgment, and responsibility."
translationKey: working-like-a-cto-with-ai-agents
categories:
  - AI Engineering
tags:
  - AI Agents
  - Codex
  - Claude
  - Engineering Management
draft: false
---

Lately, I have had a pretty strong feeling about how my work is changing.

I currently work at two tech startups. Both roles involve development and require me to keep moving things forward. Somehow, I can still handle both reasonably well.

Thinking about why, I realized that an important reason is not simply that AI helps me write code faster. I have started treating these agents as actual “employees.”

I used to think of Codex and Claude as coding assistants: I had a question, so I asked one; I needed a feature, so I asked one to build it.

Now I increasingly find myself asking different questions:

- Which agent should get this task, and what is each agent best suited to do?
- Which tasks can run together, and which need to happen in order?
- Who will track the work?
- Which decisions can agents make themselves, and which need to come back to me?

My own role has gradually changed too. Previously, I would understand a requirement, write the code, debug it, run tests, and move on to the next task. Now it feels more like managing a very small engineering team.

In a way, my working style is starting to feel a little like a CTO's. I mean the way I work, rather than a job title. I spend more time setting direction, breaking down tasks, assigning work, resolving blockers, and reviewing results, instead of personally completing every implementation.

---

## I care less about which agent is strongest and more about what each one is suited for

Once I started treating agents as employees, one thing became very obvious: different agents have different “personalities.” More precisely, their product direction, training, and tools make them behave quite differently in practice.

So I am less interested in asking whether Codex or Claude is stronger. That feels a bit like asking whether a tech lead or a strong senior engineer is stronger. The more useful question is: **What do you want it to do?**

In my own experience, Codex fits particularly well in a leadership and coordination role. This is my personal experience, not an objective benchmark.

A few characteristics make it useful there.

First, it seems eager to work with external programs and new tools. My impression is that its product direction puts a lot of emphasis on getting models to work with other tools: terminals, external programs, workflows, and newer capabilities.

When I want an agent to read Linear, operate a terminal, check another agent's status, call external tools, or connect several systems, Codex is the one I naturally think of.

Second, there is multimodality, especially voice. My understanding is that this is another area its product direction emphasizes, and I really like talking to Codex directly.

In development, the idea in my head is often still half formed. Typing it all out feels slow, especially when it sounds like: “I think this ticket should change this way, but we may need to consider something else here, and this part is also related to that earlier feature…”

That could become a long paragraph. Speaking it might take a few dozen seconds, after which Codex can organize it. In my experience, its voice recognition and understanding are fairly consistent. That makes it a useful first interface between me and the whole agent team.

Its replies are also usually concise, which matters to me. When it is acting as a lead, I do not need several thousand words of reasoning every time. I often just need to know where a ticket stands, which agent is blocked, which has finished, which needs an answer from me, and what we should move forward next. A quick summary is more valuable in that situation.

---

## Claude feels quite different to me

Claude feels more like a deeply engineering-minded person. That has been a strong impression throughout my use of it.

It is cautious, and its reasoning tends to be more extensive. Given a repository and a feature to change, it often starts by checking for `AGENTS.md`, development rules, a README, existing practices, and established patterns.

When changing code, it often seems aware that a local change might affect something elsewhere. Who else calls this function? Will changing this type affect another module? Is this state consumed somewhere else? Will existing tests be affected?

That caution can make it feel slower. Sometimes it is too cautious: it keeps needing input about the intended behavior, permissions, or whether it may affect another module.

Still, I find that temperament well suited to implementation. My current division of work is roughly:

**I set direction.**

**Codex acts more like a lead.**

**Claude agents act more like the engineers doing the implementation.**

The roles are flexible: Codex can write code, and Claude can plan. This arrangement just works smoothly in my actual day-to-day use.

---

## Linear works well as the agent team's work system

My development workflow is now largely ticket based. We use Linear, and I increasingly feel that a tool like it is naturally suited to agents.

A ticket is a clear unit of work with a state: Backlog, In Progress, Review, Complete, or a custom state. In that sense, it is a state machine for development work.

That is useful for agents. When everything lives in chat, it gets messy: we discuss one thing today, another tomorrow, and later struggle to remember where the earlier work stands.

A ticket gives us a concrete object with a description, status, comments, recorded decisions, and the ability to create further tickets.

Sometimes my daily workflow is simple. I ask Codex to read Linear and summarize which tickets can move forward, which are in progress, which are blocked, and which are ready for review. Then we discuss them one at a time.

---

## I clarify a ticket with Codex before handing it to Claude

This has become an important change in my workflow.

I used to send tickets straight to Claude, but that often led to rework. People do not always write clear tickets. Sometimes I have not fully worked out the requirement myself.

“Optimize this part” or “Make this workflow smoother” is not really an engineering task yet. It leaves too much implicit:

- Which features must stay untouched?
- Should existing behavior be preserved?
- Is this a UI change, or does the backend need to change too?
- What counts as finished?
- Which edge cases matter, and what tests are needed?

Without those details, Claude may very diligently solve the wrong problem. Then I look at the result and say, “That is not what I meant,” and we start again.

Now I prefer to talk it through with Codex first, often by voice. My explanation can be incomplete or messy. Codex helps organize it and clarify the real problem, the behavior we must preserve, the dependencies, the effects of one change on another, and the acceptance criteria.

Once that is clear, it turns the task into a prompt that Claude can execute more accurately.

People have talked about prompt engineering for years. I increasingly think that writing prompts for agents may itself become an agent's job. I speak naturally to Codex; it turns my words into an engineering task for another agent. That is much more efficient for me.

There is a condition, though: Codex can misunderstand too. I still check that its task description reflects what I actually want. AI writing prompts for AI does not remove the need for human review.

---

## Codex acts like a layer of middle management

The real value of this setup appears when there are many agents.

With one Claude agent, the process is straightforward: give it a task, let it work, and inspect the result.

With ten tickets, there may be twenty or more subtasks covering frontend, backend, databases, migrations, tests, and different modules. The management load grows quickly.

Those tasks all have different states. Some are working, some are finished, some have failed tests, some need input or permission, and some discover another bug or work outside the current ticket.

If every one of those interruptions comes directly to me, more agents actually make me busier.

I need Codex to handle that layer. Its job goes beyond sending tasks out: it reads agent status, combines information from multiple tasks, resolves straightforward issues, and escalates decisions that really need me.

Instead of facing twenty agents directly, I deal with Codex. It might tell me:

> Twelve tasks are still running. Five are finished. Two have failed tests, but the causes are clear and the agents are already working on fixes. One needs you to confirm the product behavior.

That is enough.

It feels similar to a company's management structure. A CEO or CTO cannot manage every daily detail for dozens of people. Someone has to compress the information. That is what a lead agent does for me.

---

## With more agents, parallel work becomes the biggest gain

One part of AI coding is easy to underestimate. People often ask how many times faster AI can build a feature than a person. I increasingly think the larger gain comes from parallel work.

Suppose a ticket involves three modules without strong dependencies between them. They can be worked on simultaneously.

Codex can map the dependencies: A must happen first; B and C can run together; D must wait for B's interface to stabilize. It can then give B and C to separate Claude agents.

Working alone, I would finish B, then C, then D. Now much of the work can happen at the same time. Software development starts shifting from sequential work toward parallel work.

The benefit also extends to my own attention. Once I send out three implementation tasks, I can discuss the next ticket, attend a meeting, review another PR, deal with work at the other company, or think about a new requirement.

Work that used to block me becomes asynchronous. I think this is a major reason I can handle both roles. AI has given me a way to keep many things moving at once, beyond simply making me a faster programmer.

---

## Why I use the terminal to let Codex manage Claude

I prefer having Codex operate and inspect Claude agents through the terminal, rather than opening interfaces and switching between windows like a person would.

The terminal feels more natural for an agent. A GUI gives humans colors, icons, and progress bars that we can understand at a glance. Codex can instead read something like:

```text
Agent A: running
Agent B: needs input
Agent C: test failed
Agent D: completed
```

It can read the status, operate directly, inspect processes, and send commands.

Sometimes I think **the terminal is an agent's own UI.** Humans have dashboards; agents have CLIs. That arrangement feels very natural to me.

---

## Permissions can have a management layer too

Claude's caution is both a strength and a challenge. It may stop to ask whether it can have a permission, change a file, run a command, or delete something. Across many agents, those requests add up.

I am exploring how Codex can make an initial judgment, but there is an important boundary: its assessment alone should not make every action automatically acceptable.

A person should define the permission boundary first. Running tests, reading code, editing local files, and clearly low-risk, reversible operations can be allowed within it.

Production changes, sensitive data, deleting important material, irreversible operations, or actions clearly outside the current task still need to come back to me.

I want Codex to reduce unnecessary confirmations while I retain responsibility. Since I work across two companies, their repositories, data, and permissions must remain separate. More agents make clear boundaries even more important.

---

## A completed ticket can lead to new tickets

Real development work is rarely isolated. While implementing a feature, we may discover an old bug, a module that should eventually be refactored, or a follow-up that would improve something already working.

I used to continue doing that work immediately, and the original ticket would keep growing.

Now I prefer to have Codex create another ticket. If the current acceptance criteria have been met, we record the separate issue, finish the current ticket, and put the new work into the backlog to discuss, break down, and assign later.

That creates a natural cycle:

1. I talk to Codex, and it reads Linear.
2. We clarify the ticket, and Codex breaks down the work.
3. Claude executes, while Codex tracks its status.
4. Codex handles low-risk issues and brings decisions back to me.
5. We review the result and create tickets for any newly discovered work.
6. The next cycle begins.

I am becoming increasingly comfortable with that loop.

---

## The more I build this workflow, the more I feel humans cannot be removed

Looking at this setup, it is easy to ask: if Codex manages Claude, Claude writes code, and Linear tracks tickets, what am I here for?

My experience points in the opposite direction. The more automated the workflow becomes, the more important the human role feels. That role is moving to a different level.

If Linear already contains a clear ticket, AI can read it, analyze it, break it down, write code, run tests, review the work, and create follow-up tickets.

But what if the ticket does not exist? Who proposes the first one?

Many valuable things do not initially appear as tickets. I may notice in a meeting that the team keeps getting blocked by the same issue. I may realize that customers want something different from what we are building, that a workflow will become a bottleneck, or that an architecture that works today will become hard to maintain in six months.

I may also recognize that something technically fascinating has little value for the company right now.

Those judgments are difficult to make from a repository alone. People carry a broader business context: where the company is going, what customers actually care about, the resources available, why something matters now, and why something else should wait.

AI can read a lot of context, but it works from the context it receives. Much of a company's real context is unwritten. Some of it is still only in people's heads.

I like putting it this way:

**AI can help me write a ticket.**

**But a person first needs to notice that there should be a ticket here.**

That is an especially important human role right now.

---

## People still need to make long-term decisions

Long-term direction is another part that I do not think AI can fully replace.

Whether a feature can be built in the short term is often easy to assess. Other questions are harder:

- Should we change the whole architecture for this customer's request?
- Should we pay down this technical debt now?
- Do we use a quick workaround or take the opportunity to refactor?
- Will this work have value over the next six months?
- Should we improve speed now or add capabilities first?

These are not purely technical questions. They involve business judgment, time, resources, risk, the team's situation, customer relationships, future plans, and company strategy.

AI can help analyze them, and I ask it for different options. But I still think a person should make the final judgment, because people ultimately bear the consequences.

---

## People sometimes find a simpler approach

I encounter this often in development. Given a problem, AI generally works very seriously on solving it.

Ask how a workflow can support another state, and it may add a state, change the schema, introduce a service, write a migration, and add tests. It delivers a complete engineering solution.

Sometimes I look at it and ask: why do we need that state at all? Could we remove the entry point? Why change the backend if the frontend could prevent users from reaching this situation? Is the requirement even worth doing?

Good engineering sometimes means discovering that a problem does not need such a complicated solution.

AI can find simple solutions too. I just do not assume it will always proactively question the original premise. I still keep asking whether we really need to do this, whether there is a simpler way, and whether our original framing was wrong.

That is another important part of the human role.

---

## Working “like a CTO” means more than writing less code

When I say my work feels a little like a CTO's, I mean that my attention is moving between levels of work.

Previously, much of my day involved figuring out how to write a function, locate a bug, fix a failing test, or integrate an API. I still look at those things.

But I spend more time asking what is worth doing, whether a ticket defines the right problem, how to split the work, what can run in parallel, and whether the result meets the business need.

I also ask whether a permission should be granted, whether an agent is actually blocked or simply missing information, whether an issue belongs in the current task or a later ticket, and what an architectural decision will mean in the future.

AI has shifted more of my contribution from execution toward judgment.

Previously:

**Decision + Coordination + Execution were all my responsibility.**

Now it increasingly looks like:

**I focus on Direction, Judgment, and Prioritization.**

**Codex handles Coordination, Decomposition, and Communication.**

**Claude agents handle Execution, Implementation, and Verification.**

The boundaries are less tidy in reality, but that is the general structure.

---

## The destination of AI coding may be more than a “faster programmer”

I used to imagine that AI coding would eventually make a programmer extraordinarily fast: one feature a day becomes five.

Now I increasingly think the deeper change may be in how software development is organized.

When one person can lead many agents, code-writing speed becomes only one of the bottlenecks. Others include defining the problem, dividing tasks well, establishing context, managing permissions, controlling the complexity of parallel work, and bringing important decisions back to a person.

Most of all: **Can you judge what is worth doing?**

If engineers are going to manage many agents, engineering management skills may become more important. Alongside managing people, we may need to manage agents.

Different agents really do feel like different kinds of employees, with their own strengths and weaknesses. A higher benchmark score does not mean one model should do everything. You need to understand each one and place it where it works best.

For me, the comfortable arrangement is to talk to Codex, let it coordinate, let Claude implement, and have Codex bring the status back. The important judgments return to me, and we move on to the next ticket.

This lets me handle far more work than before. It also makes one thing increasingly clear:

**I can delegate much of the “how” to agents.**

**But what is worth doing, why, when, how far to take it, and what consequences we ultimately accept remain human responsibilities.**

At least for now, I think that is the most important part of the whole system.
