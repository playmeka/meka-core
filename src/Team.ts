import { v4 as uuidv4 } from "uuid";
import Game from "./Game";
import { FighterClassName } from "./fighters";

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
  settings: TeamSettings;
};

type TeamProps = {
  id?: string;
  color?: string;
  foodCount?: number;
};

// TODO: Should TeamSettings have settings for each unit type whether it makes sense to include or not?
type TeamSettings = {
  cost: { [key in "Citizen" | FighterClassName]: number };
  speed: { [key in "Citizen" | FighterClassName]: number };
  baseHP: { [key in "Citizen" | "HQ" | FighterClassName]: number };
  range: { [key in "HQ" | FighterClassName]: number };
  baseAttackDamage: { [key in "HQ" | FighterClassName]: number };
};

export default class Team {
  game: Game;
  id: string;
  color: string;
  foodCount: number;
  settings: TeamSettings;

  constructor(game: Game, props: TeamProps) {
    this.game = game;
    this.id = props.id || `${uuidv4()}`;
    this.color = props.color || "blue";
    this.foodCount = props.foodCount || 0;
    this.settings = DEFAULT_SETTINGS;
  }

  get pop() {
    return this.citizens.length + this.fighters.length;
  }

  get hq() {
    return this.game.hqsList.find(hq => hq.team.id === this.id);
  }

  get citizens() {
    return this.game.citizensList.filter(
      citizen => citizen.team.id === this.id
    );
  }

  get fighters() {
    return this.game.fightersList.filter(
      fighter => fighter.team.id === this.id
    );
  }

  toJSON() {
    return {
      id: this.id,
      color: this.color,
      foodCount: this.foodCount,
      settings: this.settings
    } as TeamJSON;
  }

  static fromJSON(game: Game, json: TeamJSON) {
    return new Team(game, { ...json });
  }

  addFood() {
    this.foodCount += 1;
  }

  spendFood(spendCount: number) {
    this.foodCount -= spendCount;
  }
}
