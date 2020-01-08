import { observable, action } from "mobx";
import ObjectWithPosition, { Position } from "./ObjectWithPosition";
import shuffle from "lodash/shuffle";
import { Action } from "./Battle";

export default class Citizen extends ObjectWithPosition {
  class = "Citizen";

  @observable food = null;
  @observable hp = 10;

  constructor(team, props = {}) {
    super(props);
    this.id = props.id || Math.floor(Math.random() * 10000);
    this.team = team;
  }

  get battle() {
    return this.team.battle;
  }

  toJSON() {
    return {
      id: this.id,
      class: this.class,
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
    this.battle.killCitizen(this);
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