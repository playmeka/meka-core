<img src="https://playmeka.com/meka-logo-black.svg" width="30%" />


# meka-core

The `meka-core` library is written in Typescript and includes all of the MEKA game engine logic.

## Getting started
Install `meka-core` via Yarn:
```
yarn add @meka-js/core
```
And import classes from the library using es6:
```
import { Game, Team } from "@meka-js/core";
```
If you'd like to see example code that uses `meka-core`, check out [meka-boilerplate](https://github.com/playmeka/meka-boilerplate). Otherwise, read on for documentation about the game engine, classes, and helper functions.

# Classes

## Game
The `Game` class is the source of truth for the game, holding references to all relevant data.
### Properties
#### `id: string`
The ID of the game, used across MEKA.

#### `width: number`
The width of the game in number of positions. The left-most position has property `x` set to `0`, and the right-most position has `x` value of `width - 1`.

#### `height: number`
The height of the game in number of positions. The top position has `y` set to `0`, and the bottom position has `y` of `height - 1`.

#### `turn: number`
While MEKA is a real-time strategy game, actions are still batched into turns. Turns proceed in ascending order from `0` upwards.

#### `teams: Team[]`
An array of the teams competing in the game. Each is structured as a `Team`.

#### `wallsList: Wall[]`
An array of walls, each structured as a `Wall`.

#### `foodsList: Food[]`
An array of food objects, each structured as a `Food`.

#### `citizensList: Citizen[]`
An array of citizens, each structured as a `Citizen`. The list includes citizens from both teams.

#### `fightersList: Fighter[]`
An array of fighters, each structured as a `Fighter`. The list includes fighters from both teams. The `Fighter` class is an abstract class, so each fighter object is actually either `InfantryFighter`, `RangedFighter` or `CavalaryFighter` (all extensions of `Fighter`).

#### `hqsList: HQ[]`
An array of HQs, each structured as an `HQ`. The list includes the HQs from both teams.

#### `isOver: boolean`
Returns `true` if the game is over.

#### `winnerId: string | null | undefined`
The ID of the winning team (if applicable). If `undefined`, the game is still in progress. If `null`, the game is a draw. 

#### `positions: Position[]`
An array of all positions on the game map, each structured as a `Position`. 

#### `lookup: {[id: string]: Unit | Food}`
A map for looking up an arbitrary HQ, citizen, fighter, or food by its ID.

### Methods

#### `getTeam(teamId: string): Team`
Look up a team by its ID.

## Position

## Food

## Wall

## Team

## Citizen

## Fighter

## HQ

## Command

## Action

## CommandResponse

# Helpers

## isInBounds

## isValidPosition

## isValidFoodPosition

