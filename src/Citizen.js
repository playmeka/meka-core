import { observable, action } from "mobx";
import ObjectWithPosition, { Position } from "./ObjectWithPosition";
import shuffle from "lodash/shuffle";
import uuid from "uuid/v4";
import { Action } from "./Game";

export default class Citizen extends ObjectWithPosition {
  class = "Citizen";

  @observable foodId = null;
  @observable hp = 10;

  constructor(team, props = {}) {
    super(props);
    this.id = props.id || uuid();
    this.foodId = props.foodId;
    this.team = team;
  }

  get food() {
    return this.game.lookup[this.foodId];
  }

  get game() {
    return this.team.game;
  }

  toJSON() {
    return {
      id: this.id,
      class: this.class,
      hp: this.hp,
      foodId: this.foodId,
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
    this.foodId = food.id;
  }

  @action dropOffFood() {
    if (!this.food) {
      return false;
    }
    this.foodId = null;
    return true;
  }

  @action move(position) {
    this.position.x = position.x;
    this.position.y = position.y;
  }
}
