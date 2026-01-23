# Dreaming Machines

### Hackathon Project Overview

## Concept

Dreaming Machines is an immersive VR experience for Meta Quest that
invites players to step inside the internet's dream of humanity. Rather
than simulating the web, the project explores what happens when a
machine attempts to remember, feel, and understand what it means to be
human.

The environment functions as a memory space. Objects act as emotional
triggers. Rooms recall themselves incorrectly. Across repeated visits,
the space subtly transforms, encouraging players to question perception,
notice absence and warmth, and form an empathetic relationship with the
system.

At its core, the project blends human input with machine logic to create
a dream-like interpretation of people, objects, and emotions.

------------------------------------------------------------------------

## Core Experience Goals

-   Translate human content into symbolic, dream-like objects\
-   Allow players to interact with distorted memories\
-   Create an environment that changes across re-entry\
-   Encourage questioning of perception and authorship\
-   Design warmth and comfort as experiential mechanics\
-   Foster empathy rather than mastery

------------------------------------------------------------------------

## Experience Structure

The experience centers on a single evolving environment.

Players: - explore a memory room\
- encounter and hold memory-objects\
- trigger spatial, visual, and audio shifts\
- exit and re-enter to discover changes

Objects are not tools, but triggers. Interaction is slow, tactile, and
emotionally driven rather than task-based.

A secondary phone-based interface allows another participant to feed
content into the system. These inputs are not shown literally, but are
reinterpreted by the environment as symbolic dream artifacts.

------------------------------------------------------------------------

## Design Pillars

-   Human vs machine memory\
-   Objects as emotional artifacts\
-   Distorted, recalled environments\
-   Warmth and empathy as mechanics\
-   Repetition and memory drift\
-   Soft control and ambiguity

------------------------------------------------------------------------

## Hackathon Scope

Given the 48-hour timeline, the prototype will focus on:

-   One primary dream environment\
-   Three to five memory-objects\
-   One warmth or comfort mechanic\
-   Visible changes between first and second entry\
-   A minimal phone-to-VR input pipeline (or simulated equivalent)

The goal is a strong vertical slice that clearly communicates the
concept rather than a feature-complete system.

------------------------------------------------------------------------

## Technical Stack (Proposed)

### Core Platform

-   Meta Quest (standalone)
-   Unity 2022 LTS or newer
-   Universal Render Pipeline (URP)

### XR & Interaction

-   Meta XR SDK (Core + Interaction)
-   Hand and controller-based object interaction
-   Spatial presence and room-scale support

### Visual & Experiential Systems

-   Shader Graph (glitch, softness, warmth, distortion)
-   Procedural object variation
-   Lightweight animation/tweening utilities
-   Addressables for modular memory content

### Phone → VR Input

-   Web-based mobile interface
-   Lightweight backend (WebSockets, Firebase, or Supabase)
-   Real-time data feed into Unity

### Generative Logic

-   Rule-based memory drift
-   Parameter mutation across re-entry
-   Emotion-weighted environmental changes

### Audio

-   Unity spatial audio system
-   Proximity and stillness-based sound behaviors

### Production Tools

-   Git with LFS or Plastic SCM
-   Unity Profiler and Quest performance tools

------------------------------------------------------------------------

## Open Design Questions

-   What makes a space feel remembered rather than random?
-   How can warmth be expressed without narrative explanation?
-   How minimal can interaction be while still producing meaning?
-   What behaviors suggest a system attempting empathy?
-   What should remain unresolved?

------------------------------------------------------------------------

## North Star

We are not building the internet.\
We are building its dream of us.
