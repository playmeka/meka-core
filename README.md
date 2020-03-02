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
The `Position` class wraps a particular x, y coordinate pair. Nearly everything in MEKA has a position.
```
import { Position } from "@meka-js/core";
const position = new Position(2, 5);
```

### Properties
#### `x: number`
The `x` coordinate for the position.

#### `y: number`
The `y` coordinate for the position.

#### `key: string`
A standardized `key` that is used in maps indexed by positions, like `foods` on `Game`. Returns a string of format `<x>,<y>`.

#### `adjacents: Position[]`
Returns list of directly adjacent positions. For example:
```
const position = new Position(4, 4);
position.adjacents
> [
  Position { x: 5, y: 4 },
  Position { x: 3, y: 4 },
  Position { x: 4, y: 5 },
  Position { x: 4, y: 3 }
]
```
### Methods
#### `isEqualTo(position: Position | PositionJSON): boolean`
Compares position with another position (either as an instance of `Position` or serialized `Position`).

#### `isAdjacentTo(position: Position): boolean`
Checks whether position is adjacent to provided position (structured as `Position`).

#### `isAdjacentToAny(positions: Position[] | Position): boolean`
Takes any number of positions and checks whether any of them are adjacent to the position.

#### `adjacentsWithinDistance(distance: number): Position[]`
Like the `adjacents` property, but it returns a list of positions that are within `distance` steps from the position.

## ObjectWithPosition
The `ObjectWithPosition` is a generic class extended by classes which have a position, like `Food`, `Citizen`, `Fighter`, and `HQ`. All of the properties and methods below are available in those classes too.

### Properties
#### `position: Position`
The position of the object.

#### `key: string`
The `key` property of the object's position.

#### `x: number`
The `x` coordinate of the object's position.

#### `y: number`
The `y` coordinate of the object's position.

#### `width: number`
The number of positions the object covers on the x-axis.

#### `height: number`
The number of positions the object covers on the y-xis.

#### `covering: Position[]`
An array of the positions covered by the object. Note that instances of `ObjectWithPosition` are anchored to their top-left corner. So an `HQ` with position `{x: 2, y: 2}`, width `2`, and height `2` would cover `{x: 2, y: 2}`, `{x: 3, y: 2}`, `{x: 2, y: 3}`, and `{x: 3, y: 3}`.

## Food
The `Food` class represents the primary resource in MEKA. Food can be collected by citizens, dropped off at HQs, and used to pay for spawning new units. `Food` is an extension of `ObjectWithPosition`, so it has access to all the same properties. 

### Properties
#### `id: string`
The ID of the food, which is used to reference the food when it's picked up by a citizen or looked up in `Game#lookup`.

#### `eatenBy: Citizen`
If the food has been collected (or "eaten") by a citizen, `eatenBy` will return that citizen.

## Wall
Walls are blockages on the map, and units or food cannot be placed on positions with a wall. The `Wall` class extends `ObjectWithPosition`, so all properties and methods from `ObjectWithPosition` are available on an instance of `Wall` too. Note that while a unit cannot move through a wall, ranged fighters can still attack over a wall.

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

