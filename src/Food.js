import { observable, computed, action } from "mobx";
import ObjectWithPosition, { Position } from "./ObjectWithPosition";

export default class Food extends ObjectWithPosition {
  class = "Food";

  @observable eatenById = null;

  constructor(game, props = {}) {
    super(props);
    this.game = game;
    this.eatenById = props.eatenById;
  }

  @computed get eatenBy() {
    return this.game.lookup[this.eatenById];
  }

  @action getEatenBy(agent) {
    this.eatenById = agent.id;
  }

  @action move(position) {
    this.position.x = position.x;
    this.position.y = position.y;
  }

  toJSON() {
    return [this.id, this.position.x, this.position.y, this.eatenById];
  }

  static fromJSON(game, json) {
    return new Food(game, {
      id: json[0],
      position: { x: json[1], y: json[2] },
      eatenById: json[3]
    });
  }
}
