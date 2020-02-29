import {
  default as MoveCommand,
  MoveCommandJSON,
  MoveCommandArgs
} from "./MoveCommand";
import {
  default as AttackCommand,
  AttackCommandJSON,
  AttackCommandArgs
} from "./AttackCommand";
import {
  default as DropOffFoodCommand,
  DropOffFoodCommandJSON,
  DropOffFoodCommandArgs
} from "./DropOffFoodCommand";
import {
  default as SpawnCommand,
  SpawnCommandJSON,
  SpawnCommandArgs
} from "./SpawnCommand";
import {
  default as PickUpFoodCommand,
  PickUpFoodCommandJSON,
  PickUpFoodCommandArgs
} from "./PickUpFoodCommand";

export {
  default as MoveCommand,
  MoveCommandJSON,
  MoveCommandArgs
} from "./MoveCommand";
export {
  default as AttackCommand,
  AttackCommandJSON,
  AttackCommandArgs
} from "./AttackCommand";
export {
  default as DropOffFoodCommand,
  DropOffFoodCommandJSON,
  DropOffFoodCommandArgs
} from "./DropOffFoodCommand";
export {
  default as SpawnCommand,
  SpawnCommandJSON,
  SpawnCommandArgs
} from "./SpawnCommand";
export {
  default as PickUpFoodCommand,
  PickUpFoodCommandJSON,
  PickUpFoodCommandArgs
} from "./PickUpFoodCommand";
export { default as commandFromJSON } from "./commandFromJSON";
export {
  default as AbstractCommand,
  AbstractCommandJSON,
  AbstractCommandArgs
} from "./AbstractCommand";

export type CommandClassName =
  | "MoveCommand"
  | "AttackCommand"
  | "SpawnCommand"
  | "DropOffFoodCommand"
  | "PickUpFoodCommand";

export type Command =
  | MoveCommand
  | AttackCommand
  | SpawnCommand
  | DropOffFoodCommand
  | PickUpFoodCommand;

export type CommandJSON =
  | MoveCommandJSON
  | AttackCommandJSON
  | SpawnCommandJSON
  | DropOffFoodCommandJSON
  | PickUpFoodCommandJSON;

export type CommandArgs =
  | MoveCommandArgs
  | AttackCommandArgs
  | SpawnCommandArgs
  | DropOffFoodCommandArgs
  | PickUpFoodCommandArgs;
