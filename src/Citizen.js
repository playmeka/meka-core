import { observable, action } from "mobx";
import ObjectWithPosition, { Position } from "./ObjectWithPosition";
import shuffle from "lodash/shuffle";
import uuid from "uuid/v1";
import { Action } from "./Game";

export default class Citizen extends ObjectWithPosition {
  class = "Citizen";

  @observable food = null;
  @observable hp = 10;

  constructor(team, props = {}) {
    super(props);
    this.id = props.id || `${uuid()}@Citizen`;
    this.team = team;
  }

  get game() {
    return this.team.game;
  }

  toJSON() {
    return {
      id: this.id,
      class: this.class,
      hp: this.hp,
      food: this.food,
      team: { id: this.team.id },
      position: { x: this.x, y: this.y }
    };
  }

  @action takeDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.game.killCitizen(this);
  }

  @action eatFood(food) {
    this.food = food;
  }

  @action dropFood() {
    if (!this.food) {
      return false;
    }
    this.team.addFood(this.food);
    this.food = null;
  }

  @action move(position) {
    this.position.x = position.x;
    this.position.y = position.y;
  }
}
