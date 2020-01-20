const uuidv4 = require("uuid/v4");
import ObjectWithPosition, { Position } from "./ObjectWithPosition";
import Team from "./Team";
import Food from "./Food";

export default class Citizen extends ObjectWithPosition {
  class: string = "Citizen";
  foodId?: string = null;
  hp: number = 10;
  id: string;
  team: Team;

  constructor(
    team: Team,
    props: { id?: string; foodId?: string; position: Position }
  ) {
    super(props);
    this.id = props.id || uuidv4();
    this.foodId = props.foodId || null;
    this.team = team;
  }

  get food(): Food {
    return this.game.lookup[this.foodId] as Food;
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
      position: new Position(this.x, this.y)
    };
  }

  takeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.game.killCitizen(this);
  }

  eatFood(food: Food) {
    this.foodId = food.id;
  }

  dropOffFood() {
    if (!this.food) {
      return false;
    }
    this.foodId = null;
    return true;
  }

  move(position: Position) {
    this.position = position;
  }
}
