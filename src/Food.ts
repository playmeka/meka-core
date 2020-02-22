import { v4 as uuidv4 } from "uuid";
import ObjectWithPosition, { Position } from "./ObjectWithPosition";
import HQ from "./HQ";
import Game from "./Game";
import Citizen from "./Citizen";
import isValidFoodPosition from "./utils/isValidFoodPosition";

export type FoodJSON = [string, number, number, string];

export default class Food extends ObjectWithPosition {
  className = "Food";
  eatenById: string;
  game: Game;
  id: string;

  constructor(
    game: Game,
    props: {
      id?: string;
      eatenById?: string;
      position: Position;
    }
  ) {
    super(props);
    this.id = props.id || uuidv4();
    this.game = game;
    this.eatenById = props.eatenById || null;
  }

  get eatenBy() {
    return this.game.lookup[this.eatenById];
  }

  get validDropOffs() {
    return this.position.adjacents.filter(pos =>
      isValidFoodPosition(this.game, pos)
    );
  }

  getEatenBy(unit: Citizen | HQ) {
    this.eatenById = unit.id;
  }

  move(position: Position) {
    this.position = position;
  }

  isValidDropOff(position: Position) {
    return this.validDropOffs.find(
      pos => pos.x == position.x && pos.y == position.y
    );
  }

  toJSON() {
    return [
      this.id,
      this.position.x,
      this.position.y,
      this.eatenById
    ] as FoodJSON;
  }

  static fromJSON(game: Game, json: FoodJSON) {
    return new Food(game, {
      id: json[0],
      position: new Position(json[1], json[2]),
      eatenById: json[3]
    });
  }
}
