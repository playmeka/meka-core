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
export {
  default as AbstractFighter,
  AbstractFighterJSON
} from "./AbstractFighter";
export {
  default as CavalryFighter,
  CavalryFighterJSON
} from "./CavalryFighter";
export {
  default as InfantryFighter,
  InfantryFighterJSON
} from "./InfantryFighter";
export { default as RangedFighter, RangedFighterJSON } from "./RangedFighter";
export { default as fighterFromJSON } from "./fighterFromJSON";
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
