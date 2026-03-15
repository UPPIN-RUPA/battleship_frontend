# Battleship Frontend

A standalone browser-based Battleship game built with React, TypeScript, and Vite.

This project turns the classic Battleship experience into a responsive web app with visual fleet placement, live battle feedback, and a computer opponent that reacts intelligently after landing hits.

## Overview

Battleship Frontend is a complete single-page game where the player:

- places a fleet on a 10x10 grid
- rotates ships before placement
- randomizes the fleet instantly if manual setup is not needed
- attacks a hidden enemy board
- tracks hits, misses, sunk ships, and remaining fleet status
- plays against a computer that follows up on successful hits instead of firing purely at random

The app is intentionally separate from the original Java console Battleship project so the browser version can evolve on its own with a cleaner UI and frontend-focused game flow.

## What The App Does

The app recreates the full Battleship loop inside the browser:

1. Fleet deployment
   The player places each ship on the board manually or generates a random layout.

2. Battle phase
   The player attacks the enemy grid while the computer responds with its own shots.

3. Outcome tracking
   The game detects hits, misses, sunk ships, and victory or defeat automatically.

4. Visual feedback
   The interface reflects the full state of the battle in real time, including status messaging, ship progress, and board-level results.

## How The App Helps

This project helps in a few practical ways:

- It makes the game easier to understand than a console version because placement, attacks, and results are visual.
- It removes manual state tracking. The app enforces valid placement rules and handles game progression automatically.
- It provides immediate feedback, which makes the experience more engaging for demos, portfolios, and gameplay testing.
- It shows how a traditional Java console game concept can be redesigned as a modern frontend application.
- It serves as a clean example of structuring game logic in React with reusable components and utility modules.

## Core Features

- 10x10 player and enemy boards
- Manual ship placement with hover preview
- Horizontal and vertical ship rotation
- Random fleet generation
- Board reset during placement
- Turn-based battle flow
- Hit, miss, and sunk state rendering
- Computer opponent with follow-up targeting logic
- Battle status dashboard
- Fleet progress indicators
- Win/loss detection
- Responsive layout for desktop and smaller screens

## Game Flow

### 1. Deploy Your Fleet

At the start of the game, the app enters placement mode.

- The current ship to place is highlighted in Mission Control.
- Hovering over your board previews the cells the active ship will occupy.
- Invalid placements are blocked automatically.
- You can rotate the active ship before placing it.
- You can randomize the entire fleet if you want to skip manual setup.

### 2. Start The Battle

Once all ships are placed, the game switches to battle mode.

- Your board shows your fleet and the enemy's attacks.
- The enemy board remains hidden until cells are attacked.
- You attack by selecting squares on the enemy grid.

### 3. Track The Outcome

The game updates instantly after every move.

- Hits are marked clearly.
- Misses are shown separately.
- Sunk ships are recognized by the game logic.
- Mission Control updates the current phase and turn.
- The battle ends automatically when one fleet is completely destroyed.

## Computer Opponent

The enemy is not limited to blind random firing.

Its attack logic:

- starts with available legal shots
- remembers previous shots
- prioritizes neighboring cells after scoring a hit
- continues pressure on likely ship positions

This makes the game feel more active and less predictable than a basic random-shot implementation.

## Interface Sections

### Hero Section

Introduces the game and frames the objective clearly: command your fleet and sink the enemy before they sink you.

### Mission Control

This panel acts as the command center for the match.

It shows:

- the current phase
- live game messaging
- placement controls
- the ship queue
- current available actions

### Battle Snapshot

This panel summarizes the state of the game.

It includes:

- ships placed
- enemy ships still afloat
- player ships still afloat
- whose turn it is
- board legend for ship, hit, miss, and sunk states

### Player Board

Displays:

- your placed ships
- hover-based placement preview
- enemy hits and misses on your fleet

### Enemy Board

Displays:

- your attacks
- discovered hits and misses
- revealed enemy ships after game over

## Tech Stack

- React 18
- TypeScript
- Vite
- CSS

## Project Structure

```text
src/
  components/
    Board.tsx
    Dashboard.tsx
  game/
    config.ts
    helpers.ts
    types.ts
  App.tsx
  main.tsx
  styles.css
```

### Structure Notes

- `App.tsx` coordinates overall game state and battle flow.
- `components/Board.tsx` renders each game grid.
- `components/Dashboard.tsx` renders Mission Control and summary panels.
- `game/helpers.ts` contains board creation, placement, attack, and AI logic.
- `game/config.ts` defines ship configuration.
- `game/types.ts` keeps the game model explicit and typed.

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app runs locally at:

- `http://localhost:5174`

## Production Build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Why This Project Is Useful

This app is useful as:

- a playable browser game
- a frontend portfolio project
- a UI redesign of a classic console-based assignment
- a reference for React state-driven game logic
- an example of separating rendering, configuration, and gameplay helpers cleanly

## Future Improvements

Good next steps for the project:

- sound effects and richer battle animations
- difficulty levels for enemy AI
- drag-and-drop ship placement
- score tracking and match history
- multiplayer or online mode
- keyboard accessibility improvements
- unit tests for placement and attack helpers

## Summary

Battleship Frontend is a complete browser adaptation of Battleship that combines clear gameplay, responsive visuals, and maintainable React architecture. It helps players enjoy the game more visually and helps developers present a polished frontend interpretation of a classic game mechanic.
