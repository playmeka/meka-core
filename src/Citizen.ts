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
    this.foodId = props.foodId;
    this.team = team;
  }

  get food(): Food {
    return this.game.lookup[this.foodId] as Food;
  }

  get game() {
    return this.team.game;
  }

  get validMoves() {
    return this.position.adjacents.filter(move =>
      this.game.isValidPosition(move, this.team.id)
    );
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

  isValidMove(position: Position) {
    return this.validMoves.find(
      move => move.x == position.x && move.y == position.y
    );
  }

  toJSON() {
    return {
      id: this.id,
      class: this.class,
      hp: this.hp,
      foodId: this.foodId,
      team: { id: this.team.id },
      position: this.position.toJSON()
    };
  }

  static fromJSON(team: Team, json: any) {
    const position = Position.fromJSON(json.position);
    return new Citizen(team, { ...json, position });
  }
}
