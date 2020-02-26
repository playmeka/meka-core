// Imports
import {
  default as CavalryFighter,
  CavalryFighterJSON,
  CavalryFighterProps
} from "./CavalryFighter";
import {
  default as InfantryFighter,
  InfantryFighterJSON,
  InfantryFighterProps
} from "./InfantryFighter";
import {
  default as RangedFighter,
  RangedFighterJSON,
  RangedFighterProps
} from "./RangedFighter";

// Exports
export { default as BaseFighter, BaseFighterJSON } from "./BaseFighter";
export {
  default as CavalryFighter,
  CavalryFighterJSON
} from "./CavalryFighter";
export {
  default as InfantryFighter,
  InfantryFighterJSON
} from "./InfantryFighter";
export { default as RangedFighter, RangedFighterJSON } from "./RangedFighter";
export type FighterClassName =
  | "InfantryFighter"
  | "RangedFighter"
  | "CavalryFighter";
export type Fighter = CavalryFighter | InfantryFighter | RangedFighter;
export type FighterJSON =
  | CavalryFighterJSON
  | InfantryFighterJSON
  | RangedFighterJSON;
export type FighterProps =
  | CavalryFighterProps
  | InfantryFighterProps
  | RangedFighterProps;
