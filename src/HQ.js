import { observable, action, computed } from "mobx";
import ObjectWithPosition, {
  Position,
  randomPosition
} from "./ObjectWithPosition";
import shuffle from "lodash/shuffle";
import uuid from "uuid/v4";

export default class HQ extends ObjectWithPosition {
  class = "HQ";

  @observable hp = 100;

  constructor(team, props = {}) {
    super(props);
    this.team = team;
    this.id = props.id || uuid();
    this.width = props.width || 2;
    this.height = props.height || 2;
  }

  @computed get game() {
    return this.team.game;
  }

  @action takeDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) this.die();
  }

  eatFood(food) {
    return this.team.addFood(food);
  }

  die() {
    // TODO
  }

  get nextSpawnPosition() {
    const options = shuffle(this.covering);
    for (let i = 0; i < options.length; i++) {
      const position = options[i];
      if (
        !this.team.game.citizens[position.key] &&
        !this.team.game.fighters[position.key]
      ) {
        return position;
      }
    }
    return false;
  }

  toJSON() {
    return [
      this.id,
      this.team.id,
      this.width,
      this.height,
      this.position.x,
      this.position.y
    ];
  }

  static fromJSON(team, json) {
    return new HQ(team, {
      id: json[0],
      width: json[2],
      height: json[3],
      position: { x: json[4], y: json[5] }
    });
  }
}
