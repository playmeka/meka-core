import { v4 as uuidv4 } from "uuid";
import HQ, { HQJSON } from "./HQ";
import Game, { FighterType } from "./Game";
import { Position } from "./ObjectWithPosition";

const DEFAULT_SETTINGS: TeamSettings = {
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
};

export type TeamJSON = {
  id: string;
  color: string;
  foodCount: number;
  hq: HQJSON;
  settings: TeamSettings;
};

type TeamProps = {
  id?: string;
  color?: string;
  foodCount?: number;
  hq: { position: Position };
};

// TODO: Should TeamSettings have settings for each unit type whether it makes sense to include or not?
type TeamSettings = {
  cost: { [key in "Citizen" | FighterType]: number };
  speed: { [key in "Citizen" | FighterType]: number };
  baseHP: { [key in "Citizen" | "HQ" | FighterType]: number };
  range: { [key in "HQ" | FighterType]: number };
  baseAttackDamage: { [key in "HQ" | FighterType]: number };
};

export default class Team {
  game: Game;
  id: string;
  color: string;
  foodCount: number;
  hq: HQ;
  settings: TeamSettings;

  constructor(game: Game, props: TeamProps) {
    this.game = game;
    this.id = props.id || `${uuidv4()}`;
    this.color = props.color || "blue";
    this.foodCount = props.foodCount || 0;
    this.hq = new HQ(game, { teamId: this.id, ...props.hq });
    this.settings = DEFAULT_SETTINGS;
  }

  get pop() {
    return this.citizens.length + this.fighters.length;
  }

  get citizens() {
    return this.game.citizensList.filter(citizen => citizen.team.id == this.id);
  }

  get fighters() {
    return this.game.fightersList.filter(fighter => fighter.team.id == this.id);
  }

  baseAttackDamage(unitType: "HQ" | FighterType) {
    return this.settings.baseAttackDamage[unitType];
  }

  speed(unitType: "Citizen" | FighterType) {
    return this.settings.speed[unitType];
  }

  baseHP(unitType: "Citizen" | "HQ" | FighterType) {
    return this.settings.baseHP[unitType];
  }

  range(unitType: "HQ" | FighterType) {
    return this.settings.range[unitType];
  }

  cost(unitType: "Citizen" | FighterType) {
    return this.settings.cost[unitType];
  }

  toJSON() {
    return {
      id: this.id,
      color: this.color,
      foodCount: this.foodCount,
      hq: this.hq.toJSON(),
      settings: this.settings
    } as TeamJSON;
  }

  static fromJSON(game: Game, json: TeamJSON) {
    const hq = HQ.fromJSON(game, json.hq);
    return new Team(game, { ...json, hq });
  }

  addFood() {
    this.foodCount += 1;
  }

  spendFood(spendCount: number) {
    this.foodCount -= spendCount;
  }
}
