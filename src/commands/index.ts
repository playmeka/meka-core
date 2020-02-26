import { default as MoveCommand, MoveCommandJSON } from "./MoveCommand";
import { default as AttackCommand, AttackCommandJSON } from "./AttackCommand";
import {
  default as DropOffFoodCommand,
  DropOffFoodCommandJSON
} from "./DropOffFoodCommand";
import { default as SpawnCommand, SpawnCommandJSON } from "./SpawnCommand";
import {
  default as PickUpFoodCommand,
  PickUpFoodCommandJSON
} from "./PickUpFoodCommand";

export { default as MoveCommand, MoveCommandJSON } from "./MoveCommand";
export { default as AttackCommand, AttackCommandJSON } from "./AttackCommand";
export {
  default as DropOffFoodCommand,
  DropOffFoodCommandJSON
} from "./DropOffFoodCommand";
export { default as SpawnCommand, SpawnCommandJSON } from "./SpawnCommand";
export {
  default as PickUpFoodCommand,
  PickUpFoodCommandJSON
} from "./PickUpFoodCommand";

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
