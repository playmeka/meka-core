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
The `Team` class holds information about each player and references to that team's units and HQ.

### Properties
#### `id: string`
The ID of the team. This ID is the same as the given user's ID.

#### `color: string`
The color of the team. This is used primarily for rendering on the game map.

#### `pop: number`
Returns the population of the team, including citizens and fighters.

#### `hq: HQ`
A reference for the team's HQ. Each team has one HQ.

#### `citizens: Citizen[]`
An array of citizens for the team.

#### `fighters: Fighter[]`
An array of fighters for the team. This list includes fighters of all types: `InfantryFighter`, `RangedFighter`, and `CavalryFighter`.

#### `foodCount: number`
Returns the amount of food the team has available to spend. This number increases when citizens drop-off additional food.

#### `settings: SettingsObject`
Returns an object with default values for the cost, speed, HP, range, and attack damage of each unit. You can use this object for checking the cost of future units, for instance. Here's the default for a team:
```
{
  cost: {
    Citizen: 2,
    InfantryFighter: 4,
    RangedFighter: 4,
    CavalryFighter: 3
  },
  speed: {
    Citizen: 1,
    InfantryFighter: 1,
    RangedFighter: 1,
    CavalryFighter: 2
  },
  baseHP: {
    Citizen: 10,
    HQ: 500,
    InfantryFighter: 32,
    RangedFighter: 24,
    CavalryFighter: 30
  },
  range: {
    HQ: 3,
    InfantryFighter: 1,
    RangedFighter: 3,
    CavalryFighter: 1
  },
  baseAttackDamage: {
    HQ: 6,
    InfantryFighter: 10,
    RangedFighter: 7,
    CavalryFighter: 6
  }
}
```

## Citizen
Citizens are responsible for collecting food. They don't have any attack ability, but they're the only unit that can pick-up food. In a typical game, each team starts with one citizen. The `Citizen` class extends `ObjectWithPosition`, so all properties and methods on `ObjectWithPosition` are also available on `Citizen`.

### Properties
#### `id: string`
The ID for the citizen, used for identification across the game.

#### `food: Food`
If a citizen has collected a food, the `food` property will return it.

#### `validMoves: Position[]`
An array of adjacent positions that would be valid moves for the citizen. Note that a citizen cannot move onto a wall, onto another unit, or onto the opponent's HQ (though it can be positioned on its own HQ). 

#### `team: Team`
Returns the citizen's team.

#### `hp: number`
The current hit points (HP) of the citizen.

#### `baseHP: number`
The original hit points (HP) of the citizen. Citizen's normally start with `10 HP`, as you can see in the team's `settings` object.

#### `speed: number`
The speed of the citizen, structured as positions available to move per tick. The default is `1`.

### Methods
#### `getPathTo(position: Position)`
If a path is available from the citizen's position to the `position` argument, this method returns that path as an array of positions. The first position in the array is the citizen's current position, the second position is the first move, and the last position is the target position. If no path is available, this method returns `null`.

#### `getPathToTarget(target: Unit)`
Returns the shortest path from the citizen's current position to any of the positions covered by the specified `target`. For instance, if an instance of `HQ` with width of 2 and height of 2 is passed as `target`, then this method will return the shortest path to any of the HQs four positions.

## Fighter
The `Fighter` class is not itself a class, but there are various properties and methods shared by the fighter classes: `InfantryFighter`, `RangedFighter`, and `CavalryFighter`. All fighter classes extend `ObjectWithPosition`, so all properties and methods on `ObjectWithPosition` are also available in `Fighter`.

### Properties
#### `id: string`
The ID for the fighter.

#### `className: ["InfantryFighter", "CavalryFighter", "RangedFighter"]`
The child class name of the fighter (i.e. `"InfantryFighter"`).

#### `team: Team`
The team for the fighter.

#### `baseAttackDamage: number`
The fighter's default damage when attacking another unit. Note that fighters have attack bonuses versus other fighter classes. Here is a table of the default HP, attack, and bonus for the three fighter classes:

Unit | Class | HP | Attack | Bonus
--- | --- | --- | --- | ---
Infantry | `InfantryFighter` | 32 | 10 | +5 against Cavalry
Cavalry | `CavalryFighter` | 30 | 6 | +6 attack against Ranged
Ranged | `RangedFighter` | 24 | 7 | +4 attack against Infantry

#### `hp: number`
The current hit points (HP) for the fighter.

#### `baseHP: number`
The original hit points (HP) for the fighter.

#### `speed: number`
The speed (represented as positions to move per tick) of the fighter.

#### `range: number`
The range (represented as number of positions) of the fighter.

#### `validMoves: Position[]`
An array of in-range positions that would be valid moves for the fighter.

### Methods
#### `isValidMove(position: Position): boolean`
Checks whether the given `position` would be a valid move for the fighter.

#### `isValidAttack(target: Unit, position: Position): boolean`
Checks whether the given `target` and `position` would be a valid attack, meaning the `target` is in range and the given `position` would hit the target. 

#### `getAttackPositionsFor(unit: Unit): Position[]`
Returns an array of positions from which the fighter can attack the given `unit`. For a fighter of range `1` (like infantry or cavalry), this method returns the positions adjacent to the target unit. However, there are more options for a ranged fighter, for instance.

#### `getPathTo(position: Position): Position[]`
Returns an array of positions representing a path from the fighter's current position to the given `position`. The first position in the array is the fighter's current position, the last position is the target position, and each position in between represents a step in the path. If the method returns `null`, it means there is no current path between the two positions.

#### `getPathToTarget(target: Unit): Position[]`
Returns an array of positions representing the shortest path to any of the positions covered by the given `target`. 

## HQ
The `HQ` class. The `HQ` class extends `ObjectWithPosition`, so all properties and methods on `ObjectWithPosition` are also available on `HQ`. By default instances of `HQ` have width of `2` and height of `2`.

### Properties
#### `id: string`
The ID of the HQ.

#### `hp: number`
The current hit points (HP) for the HQ.

#### `baseHP: number`
The original hit points (HP) for the HQ.

#### `baseAttackDamage: number`
The HQ's default damage when attacking another unit. While fighters have attack bonuses versus other classes, the HQ has the same attack against all types. The default is `6`.

#### `range: number`
The range (represented as number of positions) of the HQ.

#### `team: Team`
The HQ's team.

#### `nextSpawnPosition: Position`
Returns one of the unoccupied positions covered by the HQ, selected at random. If there are no open positions, this property returns `null`.

### Methods
#### `isValidAttack(target: Unit, position: Position): boolean`
Checks whether the given `target` and `position` would be a valid attack, meaning the `target` is in range of the HQ and the given `position` would hit the target. 

## Command
There are multiple types of commands that extend a shared `AbstractCommand` class: `MoveCommand`, `AttackCommand`, `SpawnCommand`, `DropOffFoodCommand`, and `PickUpFoodCommand`. When a command is processed, it provides the game engine with an action (see types of actions below), depending on the current state of the game. 

### Properties
#### `id: string`
The ID of the command.

#### `unit: Unit`
The `unit` is the subject of the command (i.e. the unit who is performing an action as a result of the command).

#### `args: {...}`
The `args` object provides the command with whatever custom data is needed for execution. Each child command specifies its own format for `args`.

### MoveCommand
The `MoveCommand` tells a unit to move to a particular position. The `unit` for `MoveCommand` should be a `Fighter` or `Citizen`.

#### `args` format
```
{
  position: Position;
  autoPickUpFood?: boolean = false;
  autoDropOffFood?: boolean = false;
}
```
The `position` is the position the unit should move to. If `autoPickUpFood` (default is `false`) is set to `true` and the unit is a citizen, the citizen will pick-up food if it moves over it. If `autoDropOffFood` (default is `false`) is set to `true` and the unit is a citizen, the citizen will drop-off food when it moves over its own HQ and has foo to drop-off.

#### `getNextAction(game: Game): MoveCitizenAction | MoveFighterAction`
An instance of `MoveCommand` will try to create a `MoveAction` each tick. If a path cannot be found between the unit's current position and `args.position`, no action is returned.

#### Example
```
const citizen = new Citizen(...)
const position = new Position(...)
const command = new MoveCommand({ unit: citizen, args: { position: position } })
```

### AttackCommand
The `AttackCommand` tells a unit to attack a particular target unit. The `unit` for `AttackCommand` should be a `Fighter` or `HQ`.

#### `args` format
```
{
  targetId: string;
}
```
`targetId` is the ID of the target unit.

#### `getNextAction(game: Game): MoveFighterAction | AttackAction`
If the target is in range of the unit, the command will return an `AttackAction`. Otherwise (and only if the unit is a fighter) it will try to find a path to a position in range of the target and return a `MoveFighterAction` with the next move in that path.

#### Example
```
const fighter = new InfantryFighter(...)
const enemyFighter = new CavalryFighter(...)
const command = new AttackCommand({ unit: fighter, args: { targetId: enemyFighter.id } })
```

### SpawnCommand
The `SpawnCommand` tells an HQ (the `unit`) to spawn (i.e. create) a new unit.

#### `args` format
```
{
  position?: Position;
  unitType: "Citizen" | "InfantryFighter" | "RangedFighter" | "CavalryFighter";
}
```
The `position` argument is optional, but if it is included, the command will try to spawn the new unit on the given position if it is one of the positions covered by the HQ. The `unitType` argument specifies what kind of unit to spawn.

#### `getNextAction(game: Game): SpawnCitizenAction | SpawnFighterAction`
If the HQ has enough food to pay for the new unit, this method returns either a `SpawnCitizenAction` or a `SpawnFighterAction`.

#### Example
```
const hq = new HQ(...)
const command = new SpawnCommand({ unit: hq, args: { unitType: "RangedFighter" } })
```

### PickUpFoodCommand
The `PickUpFoodCommand` tells a citizen (as `unit`) to pick-up a given food.

#### `args` format
```
{
  foodId: string;
}
```
The `foodId` argument is the ID of the food to pick-up.

#### `getNextAction(game: Game): PickUpFoodAction | MoveCitizenAction`
If the specified food is adjacent to the citizen, the command returns a `PickUpFoodAction`. Otherwise, the shortest path to a position adjacent to the given food is found, and a `MoveCitizenAction` is returned. If no path is found, no action is returned.

#### Example
```
const citizen = new Citizen(...)
const food = new Food(...)
const command = new PickUpFoodCommand({ unit: citizen, args: { foodId: food.id } });
```

### DropOffFoodCommand
The `DropOffFoodCommand` tells a citizen (as `unit`) to drop-off their food at a position or HQ.

#### `args` format
```
{
  position?: Position;
  hqId?: string;
}
```
Either `position` or `hqId` must be included. A citizen can drop-off a food at an arbitrary position, which is specified by `position`. Otherwise, `hqId` specifies the HQ where the food should be dropped off.

#### `getNextAction(game: Game): DropOffFoodAction | MoveCitizenAction`
If the citizen is adjacent to the HQ or drop-off position, a `DropOffFoodAction` is returned by the command. Otherwise, a path is found from the citizen's current position to a position adjacent to the drop-off spot and `MoveCitizenAction` is returned. If no path is found, no action is returned.

#### Example
```
const citizen = new Citizen(...) // Citizen has food
const hq = new HQ(...)
const command = new DropOffFoodCommand({ unit: citizen, args: { hqId: hq.id } });
```

### `commandFromJSON(game: Game, json: CommandJSON): Command`
To de-serialize a command, you can look at the `className` property to determine the right constructor. Or you can use the `commandfromJSON` helper function, which will select the right command class for you and return the command. 

## Action
Actions are how the game state is mutated. Each tick, commands provide the game with actions based on the current state. Actions can also be used to recreate the state of a game. 

### Properties
#### `id: string`
The ID of the action.

#### `command: Command`
A reference to the command that initiated the action.

#### `unit: Unit`
The unit responsible for undertaking the action.

#### `args: AbstractActionArgs`
An object with data particular to the given action class.

#### `className: string`
A string representation of the action child class (i.e. `"AttackAction"`).

### AttackAction
`AttackAction` executes an attack from the `unit` to a target. The `response` is the new state of the `target`.

### DropOffFoodAction
`DropOffFoodAction` directs a citizen (as `unit`) to drop-off food at a position. The `response` is the new state of the citizen.

### MoveCitizenAction
`MoveCitizenAction` directs a citizen to move to a position. The `response` is the new state of the citizen.

### MoveFighterAction
`MoveFighterAction` directs a fighter to move to a position (within the range of its speed). The `response` is the new state of the fighter. 

### PickUpFoodAction
`PickUpFoodAction` directs a citizen to pick-up a food at a particular position. The `response` is the new state of the citizen.

### SpawnCitizenAction
`SpawnCitizenAction` executes a spawn of a new citizen by an HQ. The `response` is the newly spawned citizen.

### SpawnFighterAction
`SpawnFighterAction` executes a spawn of a new fighter by an HQ. The `response` is the newly spawned fighter.

### `actionFromJSON(game: Game, json: ActionJSON): Action`
If you want to de-serialize an action, you can look at the `className` property to determine the right constructor. Or you can use `actionfromJSON`, which will select the right action class for you and return the action.

## CommandResponse
The `CommandResponse` class is used to tell a user what happened for a particular command.

### Properties
#### `command: Command`
The command that this object is in response to.

#### `status: "success" | "failure"`
The status of the command. A `failure` status either means no action was generated for the command or there was an issue with the action. A `success` status means the associated action was implemented in the game.

#### `action?: Action`
The action created by the command.

#### `error?: string`
Any error message for describing why the command or action may have failed.

# Helpers

## isInBounds

## isValidPosition

## isValidFoodPosition

