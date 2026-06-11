---
title: From Extracting Drawing Text to Placing 2D Annotations in a 3D Scene
description: A practical engineering recap of how a simple drawing text extraction task turned into a 2D-to-3D mapping workflow for digital twins, combining SVG parsing, vision models, geometry rules, registration math, and agent tool design.
categories:
  - Ai
  - DigitalTwin
date: 2026-06-11 00:00:00
---



At the beginning, the task looked much simpler: a user uploads an engineering drawing, we extract the text from it, put that text into the chat context, and let the agent answer questions. Pretty standard document QA.

That version broke the first time someone asked a normal engineering question.

A user uploaded a drawing into our digital twin chat and asked:

> “What’s the callout near the pump?”

On the drawing, there was a text box that said:

> “Replace seal kit, see WO-4451”

A thin leader line connected that text box to pump `P-101`.

For an engineer, that is enough. The note is about `P-101`. The seal kit needs to be replaced. The work order is `WO-4451`.

Our system did not read it that way.

It opened a Python sandbox and started writing parsing code.

That was the part that made the problem obvious. The text had already been extracted. The missing piece was not the sentence itself. It was the relationship on the drawing: this note points to this pump.

We already had most of the ingredients. There was a Cesium-based 3D digital twin scene. There was an agent that could control that scene. There were also years of site knowledge sitting in 2D engineering drawings.

The problem was that these pieces were not connected.

The agent could read text, but it did not know how that text related to the shapes around it. The 3D scene had equipment, but it did not know which drawing notes referred to which objects. The drawing had useful operational knowledge, but that knowledge was still stuck on a 2D page.

At that point, the project stopped being about text extraction. What we needed was a way to read components, annotations, and relationships out of a drawing, then map them into the 3D scene.

## The first pipeline threw away the useful part

Engineering drawings do not behave like normal documents.

In a normal document, most of the meaning is in the text. In a drawing, the meaning is spread across text, symbols, lines, and position.

A P&ID or site plan usually contains a few different kinds of information:

1. **Components**: pumps, tanks, pipe racks, valves, and other equipment, usually with tags like `P-101` or `TK-7`.
    
2. **Annotations**: callouts, dimensions, revision clouds, inspection notes.
    
3. **Relationships**: a callout points to a component, a pipe connects two pieces of equipment, or a label sits inside a boundary.
    

When an engineer reads a drawing, they do not lift the text out and read it by itself. They look at where the note is, where the line goes, what equipment is nearby, and what the symbols mean.

Our first pipeline did exactly the wrong thing.

When an SVG drawing was uploaded, we sent it to a file extraction API. The API returned text. We put that text into the chat context.

So this survived:

> “Replace seal kit, see WO-4451”

But the leader line to `P-101` was gone.

For an engineer, that leader line is part of the answer. We had thrown it away before the agent even saw the problem.

That also meant OCR accuracy was not the real issue. Even perfect OCR would still leave the system unable to answer which component the note belonged to.

What we needed was a structured representation of the drawing: which objects are components, which objects are annotations, which annotations point to which components, and which components are connected to each other.

Later, if we wanted to place those things in a 3D scene, the same structure also had to tell us which 2D drawing objects could be matched to scene objects. If no matching scene object existed yet, we still wanted to keep the drawing object as a candidate entity, not just as a line of text.

## SVG gave us geometry, but not meaning

We tried two paths.

The first was to treat the drawing as an image.

We rendered the SVG into a PNG and passed it to a vision model. That was a natural path because scanned PDFs need to be handled that way anyway.

The vision model was useful. It could tell that something looked like a pump, that another region looked like a pipe, and that the title block probably contained metadata.

But the coordinates were not good enough.

If the question is “does this drawing contain a pump?”, an approximate region is fine. But we needed to map points from the 2D drawing into the 3D scene. In some cases, that point would be used for pixel picking and then resolved to a world coordinate through the depth buffer.

At that point, “somewhere around here” is too loose.

The second path was to parse the SVG as XML.

That is less exciting, but it is extremely useful. SVG already contains precise geometry. Text elements have coordinates. Lines have endpoints. Shapes have bounding boxes. Transforms like `translate`, `scale`, and `rotate` are all in the file.

An SVG looks like an image, but underneath it is also a geometry file.

The catch is that XML has no semantics. It can tell us there are lines, circles, rectangles, and text nodes. It cannot tell us that a certain cluster of shapes is a pump.

So we used both.

The vision model answered what something probably was.  
The SVG parser answered where it actually was.

The structural parser walks the SVG, resolves transforms, and extracts text positions, shape bounding boxes, and candidate leader lines. The transform handling matters. If `translate`, `scale`, or `rotate` is applied and we ignore it, the coordinates are wrong from the start.

The vision pass looks at the rendered PNG and returns semantics: this looks like a pump, this looks like a DN50 pipe, these fields look like title-block metadata.

Then we fuse the two.

For example, the vision model might say there is a pump near `(640, 360)`. The SVG parser might find a tagged group with bounding box `(632, 319, 96, 92)`. The final component takes the type from the vision model and the geometry from the SVG.

Text comes from SVG whenever possible, not from vision OCR. Engineering identifiers do not have much tolerance for small mistakes. If `WO-4451` becomes `W0-445I`, a human will probably notice. A system may treat it as a different work order.

The output of this stage is a compact JSON artifact we call the `DrawingGraph`.

The `DrawingGraph` contains components, tags, annotations, links between annotations and components, and connections between components. Everything downstream uses this graph instead of reading the raw SVG again.

## Most annotation links were just geometry

At first, we treated “which component does this annotation refer to?” as if it might need an LLM.

Most of the time, it did not.

On real drawings, the relationship is usually drawn right there. A callout has a leader line. One end is near the text box. The other end lands on or near the component.

That is a geometry problem.

The cascade we ended up using was simple:

|Layer|Signal|Confidence|
|---|---|---|
|Leader line|A segment connects the text box to a component boundary|High|
|Containment|Text sits inside a component or region boundary|Medium-high|
|Proximity|Nearest component within a reasonable radius|Lower|

The LLM only handles the leftover cases where the geometry rules do not give a good answer.

This became a useful rule for the rest of the project too: if a piece of code can calculate the answer reliably, do not ask the model to guess it. Otherwise the model will often turn a two-step geometry problem into a reasoning task.

We also store how each link was created.

A link found through a leader line is not the same as a link guessed by proximity. Downstream tools need to know the difference, so the source and confidence stay attached to each relationship.

## The agent did exactly what we accidentally asked it to do

Once the `DrawingGraph` was working, we ran into the Python sandbox issue again.

The user asked:

> “What’s the callout near the pump?”

By then, the answer was already in the drawing summary. The annotation-to-component links had been extracted and put into context.

But the agent opened the Python sandbox and started writing:

```python
json.load(...)
```

It was preparing to parse the `DrawingGraph` file by hand.

At first, this looked like the agent being stubborn. Then we checked the prompt.

We had written something like:

> If exact coordinates are needed, use the file tools to read the DrawingGraph JSON.

That line was enough to send it down the wrong path.

“Near the pump” sounds spatial. The agent decided it might need coordinates. Then it looked at its tools. The most powerful tool for reading a nested JSON file was generic code execution, so it started writing Python.

The fix had two parts.

First, we changed the prompt. We made it explicit that the summary already contains annotation-to-component links, and that the agent should answer those questions directly when possible.

Second, we added a tool that matched the job: `get_drawing_graph`.

This tool is not a general code execution tool. It is a bounded query interface. The agent can search by region, tag, or text. The tool supports pagination and truncates oversized fields.

Once that tool existed, the agent mostly stopped reaching for Python. It had a tool whose name and behavior matched the task.

This changed how I think about agent tools. Prompting matters, but the shape of the toolbox matters more than it seems. If the only flexible tool is code execution, many tasks will become coding tasks.

## Registration was the real 2D-to-3D step

Parsing the drawing was only the first half.

The next question was how to place the drawing into the 3D scene.

The `DrawingGraph` knows where objects are in drawing coordinates. The 3D scene knows where objects are in world coordinates. We needed a mapping between those two spaces.

An affine transform was enough.

That sounds boring, but boring was good here. It handles scale, rotation, translation, and the y-axis flip between SVG and map coordinates. SVG y-values grow downward. A local northing coordinate grows upward. We did not need a special case for that; the fitted coefficients capture it.

The pipeline looked like this:

1. Convert matched world positions into a local east/north plane in meters around their centroid. We do not solve directly on longitude and latitude because degrees of longitude change with latitude.
    
2. Fit the six affine coefficients using least squares. Three non-collinear point pairs are the minimum. More points make the fit more stable.
    
3. With four or more matches, run RANSAC over all 3-point subsets. Match counts are usually small, so exhaustive enumeration is fine.
    
4. Report the residual for each match in meters.
    

The residuals turned out to be one of the most useful outputs.

A message like this is much better than a generic “registration failed”:

> `TK-7` is 38 meters off. All other points are under 2 meters.

That tells the user which match to check.

RANSAC helped with bad matches. If someone accidentally matched `P-101` to another pump 200 meters away, that point should become an outlier. It should not bend the whole transform.

We added two guards after seeing the kinds of inputs users actually pick.

The first is a collinearity check. Tanks in a tank farm are often arranged in a line. If the user chooses three tanks in a row, the transform is unstable in the perpendicular direction. In that case, we reject the input and ask for another point away from the line.

The second is an extrapolation flag. If a predicted component falls outside the matched region, we mark it with `extrapolated: true` and lower its confidence. An affine fit is usually more reliable between anchors than far outside them.

## Anchors do not have to be existing entities

At first, we assumed registration would come from entity search.

The drawing has `P-101`. The digital twin has an entity named `P-101`. The system looks up that entity, gets its world position, and uses it as an anchor.

When the scene already has good asset data, that is the best path.

Then we asked the obvious cold-start question: what if the scene has no entities?

For example, the scene might just be a photogrammetry mesh. It has geometry and georeferencing, but no equipment objects, no labels, and no structured asset model.

The registration code already had the answer. The affine fit only needs point pairs:

```text
drawing x/y -> world lon/lat
```

An existing entity is just one way to get a world coordinate. It is not part of the math.

In a georeferenced Cesium scene, we can get world coordinates from the depth buffer. If a user clicks a pixel, we can resolve that pixel to a world position. If a vision model points to a location in a screenshot, that location can also be resolved into world coordinates.

So anchor acquisition became a cascade:

```text
1. Entity search
   Drawing tag matches an existing digital twin entity.

2. Drawing georeference
   Title-block grid coordinates, scale, and north direction.
   This is still being expanded.

3. Vision survey
   Detect objects in a 3D scene screenshot, then resolve detections
   to world coordinates through the depth buffer.

4. Three user clicks
   Ask the user to click P-101, then VLV-23, then E-401.
```

The last option sounds primitive, but it is useful. It works on point clouds, night scenes, incomplete models, and abstract schematics. When automated registration fails, three clicks are often the cheapest reliable fallback.

## A bug showed up while writing the workflow

One of the better bugs was found while writing documentation.

I was writing the cold-start workflow: the 3D scene has no structured entities, the user uploads a drawing, clicks three anchors, the system registers the drawing, and then the drawing components get placed into the scene.

While writing that flow end to end, I noticed a contradiction.

The placement tool skipped “matched” components. In a populated scene, that made sense. If a drawing component is already matched to an existing scene entity, we should not create another one.

But in a cold scene, the anchors clicked by the user are not existing entities. `P-101` was matched to a user click, not to a scene object.

That meant the system would place all predicted components except the three components the user had manually located.

The most reliable points in the flow were being dropped.

The root cause was that the word “matched” had changed meaning.

At first, “matched” meant “this drawing object has a corresponding world position.” Later, in part of the placement path, it started to mean “this object already exists in the scene.”

Those are not the same thing.

The fix was small. The useful part was noticing how it happened. Writing an end-to-end workflow is not just documentation. It is also a verification pass. Some bugs do not stand out in code review or unit tests. They show up when the whole flow is written down.

## The split of responsibility became clearer over time

After a few iterations, the boundaries were easier to draw.

The agent handles semantic judgment. Which digital twin entity is probably `P-101`? Which relationship type in a customer schema means “connected by pipe”? These questions are fuzzy and context-dependent, so they are good model tasks.

Tools handle deterministic work. Affine fitting, RANSAC, leader-line geometry, coordinate conversion, and residual calculation have right and wrong answers. They should come from tested code, not from a model’s plausible guess.

The vision model also has a boundary. It can classify: this looks like a pump. It should not be responsible for precise measurement. Precision comes from SVG geometry, coordinate tools, and registration math.

Humans confirm state changes.

This part is important. A bad registration is not just one wrong chat answer. It can create a batch of incorrectly placed entities in the 3D scene. We do not let the model commit those changes directly. Placements are staged first, then confirmed by the user.

We also persist intermediate artifacts between stages.

The `DrawingGraph` records what was found in the drawing: components, annotations, and relationships. The `SceneMapping` records the transform, matched points, residuals, and confidence flags.

When a placement looks wrong, those artifacts make the system debuggable. We can ask whether the drawing was parsed incorrectly, whether the entity match was wrong, or whether the coordinate fit was bad.

Without those artifacts, the system becomes a black box. When the output is wrong, there is no obvious layer to inspect first.

## Where it stands now

The full loop works now.

A user can upload an SVG drawing. The system parses components, annotations, and relationships. The user can ask questions about the drawing in natural language. The drawing can also be registered into a 3D scene using existing entities, visual recognition, or three manual anchor clicks.

After registration, drawing components are staged as candidate 3D entities with their annotations attached. Once the user confirms them, the system creates the entities and their digital twin relationships.

The next two things we want to improve are fairly clear.

One is extracting georeference information from title blocks. If a site plan already contains grid coordinates, scale, and north direction, registration could become zero-interaction for those drawings.

The other is spatial pattern matching.

For example, a drawing may contain six identical pumps. Looking at one pump alone may not be enough to decide which scene object it corresponds to. But the six pumps together form a spatial pattern. Matching that pattern should let us resolve some correspondences that are ambiguous one object at a time.

The thing that became obvious after this work is simple: the useful part of an engineering drawing is not one extracted sentence. It is the structure formed by text, symbols, geometry, and relationships together.