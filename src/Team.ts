const uuidv4 = require("uuid/v4");
import HQ from "./HQ";
import Game from "./Game";

export default class Team {
  game: Game;
  id: string;
  color: string;
  foodCount: number;
  hq: HQ;

  constructor(
    game: Game,
    props: { id?: string; color?: string; foodCount?: number; hq?: any } = {}
  ) {
    this.game = game;
    this.id = props.id || `${uuidv4()}@Team`;
    this.color = props.color || "blue";
    this.foodCount = props.foodCount || 0;
    this.hq = new HQ(this, props.hq);
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

  static fromJSON(game: Game, json: any) {
    const hq = HQ.fromJSON(this as any, json.hq);
    return new Team(game, { ...json, hq });
  }

  toJSON() {
    return {
      id: this.id,
      color: this.color,
      foodCount: this.foodCount,
      hq: this.hq.toJSON(),
      citizens: this.citizens.map(citizen => citizen.toJSON()),
      fighters: this.fighters.map(fighter => fighter.toJSON())
    };
  }

  addFood() {
    this.foodCount += 1;
  }

  spendFood(spendCount: number) {
    this.foodCount -= spendCount;
  }
}
