import { observable, action, computed } from "mobx";
import ObjectWithPosition, {
  Position,
  randomPosition
} from "./ObjectWithPosition";
import shuffle from "lodash/shuffle";
import uuid from "uuid/v1";
import Citizen from "./Citizen";
import Fighter from "./Fighter";
import { Action } from "./Game";
import HQ from "./HQ";

export default class Team {
  @observable foodCount = 0;

  constructor(game, props = {}) {
    this.game = game;
    this.id = props.id || `${uuid()}@Team`;
    this.color = props.color || "blue";
    this.hq = new HQ(this, props.hq);
  }

  @computed get pop() {
    return this.citizens.length + this.fighters.length;
  }

  @computed get citizens() {
    return this.game.citizensList.filter(citizen => citizen.team.id == this.id);
  }

  @computed get fighters() {
    return this.game.fightersList.filter(fighter => fighter.team.id == this.id);
  }

  static fromJSON(game, json) {
    const hq = HQ.fromJSON(this, json.hq);
    return new Team(game, { ...json, hq });
  }

  toJSON() {
    return {
      id: this.id,
      color: this.color,
      hq: this.hq.toJSON(),
      citizens: this.citizens.map(citizen => citizen.toJSON()),
      fighters: this.fighters.map(fighter => fighter.toJSON())
    };
  }

  @action addFood(newFood) {
    this.foodCount += 1;
  }

  @action spendFood(spendCount) {
    this.foodCount -= spendCount;
  }
}
