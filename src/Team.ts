const uuidv4 = require("uuid/v4");
import HQ, { HQJSON } from "./HQ";
import Game from "./Game";
import { Position } from "./ObjectWithPosition";

export type TeamJSON = {
  id: string;
  color: string;
  foodCount: number;
  hq: HQJSON;
};

type TeamProps = {
  id?: string;
  color?: string;
  foodCount?: number;
  hq: { position: Position };
};

export default class Team {
  game: Game;
  id: string;
  color: string;
  foodCount: number;
  hq: HQ;

  constructor(game: Game, props: TeamProps) {
    this.game = game;
    this.id = props.id || `${uuidv4()}`;
    this.color = props.color || "blue";
    this.foodCount = props.foodCount || 0;
    this.hq = new HQ(game, { teamId: this.id, ...props.hq });
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

  toJSON() {
    return {
      id: this.id,
      color: this.color,
      foodCount: this.foodCount,
      hq: this.hq.toJSON()
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
