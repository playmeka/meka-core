import { v4 as uuidv4 } from "uuid";
import ObjectWithPosition, {
  Position,
  PositionJSON
} from "./ObjectWithPosition";
import Game from "./Game";
import Food from "./Food";
import isValidPosition from "./utils/isValidPosition";

export type CitizenJSON = {
  id: string;
  className: "Citizen";
  hp: number;
  foodId?: string;
  teamId: string;
  position: PositionJSON;
  cost: number;
  speed: number;
};

export type CitizenProps = {
  teamId: string;
  position: Position;
  id?: string;
  foodId?: string;
};

export default class Citizen extends ObjectWithPosition {
  className: string = "Citizen";
  game: Game;
  hp: number = 10;
  id: string;
  teamId: string;
  foodId?: string = null;
  cost: number;
  speed: number;

  constructor(game: Game, props: CitizenProps) {
    super(props);
    this.game = game;
    this.teamId = props.teamId;
    this.id = props.id || uuidv4();
    this.foodId = props.foodId;
    this.cost = 2;
    this.speed = 1;
  }

  get food() {
    return this.game.lookup[this.foodId] as Food;
  }

  get validMoves() {
    return this.position.adjacents.filter(move =>
      isValidPosition(this.game, move, this.teamId)
    );
  }

  get team() {
    return this.game.getTeam(this.teamId);
  }

  getPathTo(position: Position) {
    return this.game.pathFinder.getPath(this, position);
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
      className: this.className,
      hp: this.hp,
      foodId: this.foodId,
      teamId: this.teamId,
      position: this.position.toJSON(),
      cost: this.cost,
      speed: this.speed
    } as CitizenJSON;
  }

  static fromJSON(game: Game, json: CitizenJSON) {
    const position = Position.fromJSON(json.position);
    return new Citizen(game, { ...json, position });
  }
}
