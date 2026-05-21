---
title: Your Agent Is Not Inconsistent Because It Is Dumb. It Just Has Too Many
  Tool Paths.
description: Using Skills to Stabilize Agent Tool Selection
categories:
  - Technology
  - Ai
date: 2026-05-07 00:00:00
---

## **Using Skills to Stabilize Agent Tool Paths**


Over the past few days, I’ve been working on something that looked simple at first, but turned out to be surprisingly messy.


I wanted an agent to understand what was visible in a 3D scene and then take action on behalf of the user.


For example:


“Find all the cars in the scene and mark them up.”


Sounds straightforward, right?


The agent already had most of the tools it needed. It could take a screenshot of the current scene. It could use a vision model to inspect the image. It could extract 2D screen coordinates. It had a tool to convert those 2D coordinates into 3D scene positions. And finally, it could call a Navigator tool to create a markup or entity at that location.


From a capability point of view, the chain was there.


So at first, I thought the hard part would be accuracy. Maybe the model would miss some cars. Maybe the bounding boxes would be slightly off. Maybe the 2D-to-3D conversion would introduce a small position error.


Those were real problems.


But they were not the main problem.


The real problem was this:


**The agent had too many ways to solve the same task.**


## **Same Task, Completely Different Path**


Let me give you a concrete example.


I asked the agent to identify the cars in a scene and add markups to their locations.


One time, it followed the path I expected:

1. Take a screenshot of the current scene.
2. Use the vision model to inspect the image.
3. Identify the cars in the screenshot.
4. Return their 2D coordinates.
5. Convert those 2D coordinates into 3D scene positions.
6. Call the Navigator tool to create markups.

This path was not perfect.


Sometimes the coordinates were slightly off. Sometimes the model missed a car. Sometimes the 2D-to-3D conversion was not accurate enough.


But at least the path made sense. It was understandable, debuggable, and improvable.


Then I asked a slightly different version of the same question.


The goal was still the same: look at the scene, find the cars, and mark them up.


But this time, the agent did something completely different.


It took a screenshot, downloaded the image, opened a Python sandbox, and tried to analyze the image using Python image-processing libraries. The problem was that the library it wanted to use did not exist in the runtime environment.


So the task failed.


Same agent.


Same toolset.


Same goal.


Slightly different wording from the user.


Completely different tool path.


That is not a small issue.


That is one of the most common failure modes I’ve seen when building real tool-using agents.


## **The Problem Is Not Too Few Tools. It Is Too Many.**


When we build agents, the natural instinct is to give them more tools.


The agent needs to see the screen? Add a screenshot tool.


It needs to understand images? Add a vision model.


It needs to analyze data? Add a Python sandbox.


It needs to query business data? Add a database tool.


It needs to manipulate the UI? Add a UI action tool.


It needs to create something in a 3D scene? Add a Navigator tool.


Each tool makes sense on its own.


But once the number of tools grows, a different problem appears.


The agent is no longer just asking:


“Can I do this?”


It also has to ask:


“Which path should I use to do this?”


And that second question is much harder than it looks.


For the same task, there may be many paths that look reasonable.


Take image-based object detection as an example.


The agent could use the vision model directly.


It could download the image and analyze it with Python.


It could query existing scene entities.


It could inspect the UI state.


It could combine several tools into a longer chain.


As human engineers, we usually know which path is more appropriate.


But to the agent, these are all just available options.


It does not naturally know which path is more stable, which one is slower, or which one is likely to fail in the current environment.


So a lot of agent failures are not caused by a lack of intelligence.


They are caused by too many choices.


## **The Execution Path Becomes Part of the Product**


This is the part that took me a while to appreciate:


For a tool-using agent, the execution path itself becomes part of the product quality.


In a normal chatbot, you mostly judge the final answer.


But in an agent system, the final answer is not enough.


You also have to care about how the agent got there.


Did it use the right tools?


Did it take an unnecessary detour?


Did it rely on an unstable runtime?


Did it turn a vision-model task into a Python image-processing task?


Did it produce a bunch of intermediate steps that looked reasonable but were not actually needed?


All of that affects reliability.


And the harder part is debugging.


If the agent takes a different path every time, the system becomes extremely hard to reason about.


Today it fails because a Python package is missing.


Tomorrow it fails because the coordinate format is wrong.


The next day it fails because it forgot to call the 2D-to-3D conversion tool.


Then suddenly it works again, because it happened to choose the right path.


That kind of system is painful to maintain.


Not because one specific tool is broken.


But because the tool combination space is too large.


## **What Skills Actually Solve**


This is where Skills become useful.


I don’t think of a Skill as just another prompt.


If that is all it is, Skills will eventually become another dumping ground for instructions.


A useful Skill is closer to a proven execution path.


It tells the agent:


What type of task this is.


Which tool to use first.


Which tool to use next.


What the intermediate output should look like.


When to continue.


When to stop.


When not to invent an answer.


In other words, a Skill does not make the agent more “free”.


It makes the agent more stable inside a complex toolset.


Going back to the car-markup example, if we already know the stable path is:


screenshot → vision model → 2D coordinates → 2D-to-3D conversion → Navigator markup


then that path should be captured.


The next time the user asks a similar question, the agent should not rediscover whether it wants to use Python or download the image.


It should reuse the path that has already been validated.


## **Skills Should Preserve Paths, Not Results**


There is an easy trap here.


When people hear “let the agent learn a Skill,” they may think about caching.


Save the previous JSON response.


Save the previous screenshot analysis.


Save the previous coordinates.


But that is not what a Skill should do.


Tool results are usually one-off.


The screenshot changes.


The scene changes.


The user changes.


The coordinates change.


The tool output may be huge.


Those are not the things worth storing inside a Skill.


A Skill should preserve the method, not the answer.


More specifically, it should preserve:


Which tools are used.


The order of those tools.


What each step needs as input.


What format the output should have.


How results should be validated.


When to fallback.


When to tell the user that the result is uncertain.


To put it simply:


Skills should not cache tool results. Skills should preserve successful execution paths.


That distinction matters.


Caching results answers the question:


“What was the answer last time?”


Preserving a path answers a more useful question:


“How should I reliably solve this type of task next time?”


## **Human-Written Skills Have a Limit**


The obvious solution is to let engineers write Skills manually.


And to be clear, that is useful.


Engineers understand the system. They know which tools are reliable. They know which paths should be avoided.


For example, I know that in this case, using the vision model directly is more aligned with the product flow than downloading an image and trying to process it inside Python.


So I can write a Skill that tells the agent how to handle this type of task.


But humans cannot anticipate everything.


Users ask things in different ways.


New tools get added.


Product behavior changes.


The same feature may behave differently across environments.


If every new case requires another manually written instruction, the system becomes hard to maintain.


The system prompt gets longer.


The number of Skills grows.


Rules start overlapping.


Some instructions become outdated.


Nobody is fully sure which ones are still safe to remove.


This is very similar to technical debt in code.


At the beginning, every rule had a reason.


Six months later, those rules have become historical baggage that nobody wants to touch.


That is why I do not like putting every feature-specific behavior into the system prompt.


The system prompt should define high-level boundaries and principles.


Specific execution paths should live closer to the tool layer, inside Skills.


And more importantly, Skills should not have to be written only by humans.


## **Let the Agent Generate Its Own Skills**


The idea I have been experimenting with is simple:


After the agent successfully completes a task, it should be able to review what it did and generate a reusable Skill from that successful path.


The Skill does not store the result.


It stores the path.


The flow looks something like this:


The user asks a task.


The agent chooses tools and completes the task.


Before giving the final response, the agent performs a self-check.


If the result is good enough, the agent summarizes the successful execution path.


The system stores that path as a reusable Skill.


The next time a similar task appears, the agent can read that Skill before choosing tools.


The important part is the self-check.


Not every successful run deserves to become a Skill.


Some runs only succeed by accident.


Some paths work, but are too slow.


Some paths use the wrong tools.


Some results look correct, but were never properly validated.


Those paths should not be preserved.


Before generating a Skill, the agent should ask itself questions like:


Did I actually complete the user’s request?


Did I use the right tools?


Was there a simpler or more stable path?


Did I invent anything when I was uncertain?


Is this path reusable for future tasks?


Does this path depend on one-off context?


Only if the path passes that kind of evaluation should it become a Skill.


That helps prevent bad paths from becoming permanent.


## **What a Self-Generated Skill Might Look Like**


Let’s go back to the same example.


If the agent successfully completes the “identify cars and add markups” task, the generated Skill should not say:


“Last time, I found three cars at these coordinates…”


That is useless. The next scene will be different.


Instead, the Skill should look more like this:


```text
When the user asks to mark visible cars in the current Navigator scene:

1. Capture a screenshot of the current Navigator view.
2. Use the vision model to identify cars in the screenshot.
3. Ask for structured bounding boxes and center-point coordinates.
4. Validate that the coordinates are within the image bounds.
5. If confidence is too low, do not create markups.
6. Pass the center-point coordinates to the Navigator 2D-to-3D conversion tool.
7. Use the returned 3D positions to create markups.
8. In the final response, explain whether the markups were created successfully and mention any uncertainty.
```


The value of this Skill is that it fixes a successful path.


It does not store the detected cars.


It does not store the screenshot.


It does not cache the tool output.


It stores how the agent should perform this type of task.


That is the reusable part.


## **At Runtime, Do Not Expose Every Tool by Default**


Once Skills exist, the next question is how to use them at runtime.


I increasingly think that a complex agent system should not expose every available tool to the agent by default.


That may sound like a limitation, but in practice it improves stability.


If the user asks to mark cars in the scene, the system can first retrieve a relevant Skill.


That Skill tells the system that this task usually needs:


A screenshot tool.


A vision model.


A 2D-to-3D conversion tool.


A Navigator markup tool.


So for this run, the system can prioritize that smaller toolset.


That makes it less likely for the agent to jump into the Python sandbox or choose an unrelated path.


This is not making the agent less capable.


It is helping it avoid unnecessary detours.


The more tools an agent has, the more important this kind of path constraint becomes.


Otherwise, the agent’s “intelligence” gets consumed by the size of the tool search space.


## **Skills Also Need to Evolve**


There is one more problem we should not ignore.


If a Skill fixes a tool path, can the Skill itself become a problem?


Yes.


Once a path is captured, it may be reused again and again.


If the Skill is bad, or if it used to be good but has become outdated, the agent may keep repeating a weak path simply because it has been formalized as a Skill.


That is basically technical debt again.


At one point, a certain implementation may have made sense.


Later, the tools changed.


The model changed.


The product changed.


The environment changed.


But the old path is still there, and because it is written as a Skill, the agent continues to trust it.


At that point, the Skill is no longer a source of stability.


It becomes inertia.


So Skills should not be treated as permanent truth.


They need an update mechanism.


One possible approach is to use Skills most of the time, but occasionally allow the agent to ignore the existing Skill and explore a new path.


This is similar to exploration in other engineering systems.


We do not want the agent to explore every time, because that makes the system unstable.


But we also do not want the agent to always follow old Skills, because that prevents the system from improving.


The balance is important.


Most of the time, the agent should reuse existing Skills.


Some of the time, it should be allowed to re-plan.


After the task is complete, the system can compare the new path against the existing Skill.


The comparison could include:


Did the new path satisfy the user’s request more accurately?


Did it use fewer tools?


Was it faster?


Did it fail less often?


Was it easier to validate?


Did it better match the current system capability?


Did it remove unnecessary intermediate steps?


If the new path is clearly better, the Skill should be updated.


If an existing Skill performs poorly over multiple runs, its priority should be reduced.


If it keeps failing, it should be deprecated.


In other words, Skills need a lifecycle.


They can be created.


They can be validated.


They can be updated.


And they can be retired.


This matters because what we really want is not a pile of permanent rules.


We want an agent system that can learn, correct itself, and gradually improve its execution paths over time.


Stability should not mean rigidity.


A good Skill system should let the agent follow reliable paths most of the time, while still leaving enough room to discover better ones.


If self-generated Skills solve the problem that humans cannot anticipate every case, then Skill evolution solves the next problem:


The agent should not be trapped by its own past experience.


The goal of a Skill is not to make the agent repeat the past forever.


The goal is to let the agent start from past success, and then keep improving.


## **What I Am Really Trying to Solve**


So the real problem I am trying to solve is not:


“How do I make the agent write better prompts?”


It is not even:


“How do I make the agent remember more things?”


The real question is:


“When there are many tools available, how do I make the agent behave more consistently?”


My answer is:


Do not only optimize the final response.


Optimize the execution path.


Do not only add more tools.


Capture successful paths.


Do not rely only on humans to write rules.


Let the agent generate Skills after successful runs.


Do not cache one-off results.


Preserve reusable methods.


And do not let Skills become permanent dead rules.


Validate them, update them, and retire them when they stop working.


That combination is what can make agent systems more reliable in real products.


## **Closing Thoughts**


A lot of conversations about agents focus on model intelligence, context windows, and tool-calling capability.


Those things matter.


But in real engineering work, there is a simpler and more practical question:


When the agent has twenty tools in front of it, which ones should it actually use?


If we cannot answer that question well, adding more tools will not make the system more reliable.


It may make it less reliable.


I increasingly believe the future of agents is not just more tools.


It is more stable tool paths.


Skills are a good starting point.


Self-generated Skills may be one way to make that idea scale.


But Skills should not become another layer of static rules.


They need to be validated.


They need to be updated.


And when they no longer work, they need to be retired.


A mature agent should not start from zero every time.


But it also should not be trapped by old paths forever.


It should learn from successful runs, preserve the method, reuse it when appropriate, and keep improving when a better path appears.


That, to me, is where Skills become interesting.
