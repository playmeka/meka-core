import { default as AttackAction, AttackActionJSON } from "./AttackAction";
import { default as MoveAction, MoveActionJSON } from "./MoveAction";
import {
  default as DropOffFoodAction,
  DropOffFoodActionJSON
} from "./DropOffFoodAction";
import { default as SpawnAction, SpawnActionJSON } from "./SpawnAction";
import {
  default as PickUpFoodAction,
  PickUpFoodActionJSON
} from "./PickUpFoodAction";

export { default as AttackAction, AttackActionJSON } from "./AttackAction";
export { default as MoveAction, MoveActionJSON } from "./MoveAction";
export {
  default as DropOffFoodAction,
  DropOffFoodActionJSON
} from "./DropOffFoodAction";
export { default as SpawnAction, SpawnActionJSON } from "./SpawnAction";
export {
  default as PickUpFoodAction,
  PickUpFoodActionJSON
} from "./PickUpFoodAction";
export { default as BaseAction } from "./BaseAction";
export { default as actionFromJSON } from "./actionFromJSON";

export type ActionClassName =
  | "AttackAction"
  | "MoveAction"
  | "SpawnAction"
  | "DropOffFoodAction"
  | "PickUpFoodAction";

export type Action =
  | AttackAction
  | MoveAction
  | SpawnAction
  | DropOffFoodAction
  | PickUpFoodAction;

export type ActionJSON =
  | AttackActionJSON
  | MoveActionJSON
  | SpawnActionJSON
  | DropOffFoodActionJSON
  | PickUpFoodActionJSON;
