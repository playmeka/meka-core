import {
  default as AttackAction,
  AttackActionJSON,
  AttackActionArgs
} from "./AttackAction";
import {
  default as MoveCitizenAction,
  MoveCitizenActionJSON,
  MoveCitizenActionArgs
} from "./MoveCitizenAction";
import {
  default as MoveFighterAction,
  MoveFighterActionJSON,
  MoveFighterActionArgs
} from "./MoveFighterAction";
import {
  default as DropOffFoodAction,
  DropOffFoodActionJSON,
  DropOffFoodActionArgs
} from "./DropOffFoodAction";
import {
  default as SpawnCitizenAction,
  SpawnCitizenActionJSON,
  SpawnCitizenActionArgs
} from "./SpawnCitizenAction";
import {
  default as SpawnFighterAction,
  SpawnFighterActionJSON,
  SpawnFighterActionArgs
} from "./SpawnFighterAction";
import {
  default as PickUpFoodAction,
  PickUpFoodActionJSON,
  PickUpFoodActionArgs
} from "./PickUpFoodAction";

export {
  default as AttackAction,
  AttackActionJSON,
  AttackActionArgs
} from "./AttackAction";
export {
  default as MoveCitizenAction,
  MoveCitizenActionJSON,
  MoveCitizenActionArgs
} from "./MoveCitizenAction";
export {
  default as MoveFighterAction,
  MoveFighterActionJSON,
  MoveFighterActionArgs
} from "./MoveFighterAction";
export {
  default as DropOffFoodAction,
  DropOffFoodActionJSON,
  DropOffFoodActionArgs
} from "./DropOffFoodAction";
export {
  default as SpawnCitizenAction,
  SpawnCitizenActionJSON,
  SpawnCitizenActionArgs
} from "./SpawnCitizenAction";
export {
  default as SpawnFighterAction,
  SpawnFighterActionJSON,
  SpawnFighterActionArgs
} from "./SpawnFighterAction";
export {
  default as PickUpFoodAction,
  PickUpFoodActionJSON,
  PickUpFoodActionArgs
} from "./PickUpFoodAction";
export { default as BaseAction } from "./BaseAction";
export { default as actionFromJSON } from "./actionFromJSON";

export type ActionClassName =
  | "AttackAction"
  | "MoveAction"
  | "SpawnCitizenAction"
  | "SpawnFighterAction"
  | "DropOffFoodAction"
  | "PickUpFoodAction";

export type Action =
  | AttackAction
  | MoveCitizenAction
  | MoveFighterAction
  | SpawnCitizenAction
  | SpawnFighterAction
  | DropOffFoodAction
  | PickUpFoodAction;

export type ActionJSON =
  | AttackActionJSON
  | MoveCitizenActionJSON
  | MoveFighterActionJSON
  | SpawnCitizenActionJSON
  | SpawnFighterActionJSON
  | DropOffFoodActionJSON
  | PickUpFoodActionJSON;

export type ActionArgs =
  | AttackActionArgs
  | MoveCitizenActionArgs
  | MoveFighterActionArgs
  | SpawnCitizenActionArgs
  | SpawnFighterActionArgs
  | DropOffFoodActionArgs
  | PickUpFoodActionArgs;
