const uuidv4 = require("uuid/v4");
import ObjectWithPosition, { Position } from "./ObjectWithPosition";
import HQ from "./HQ";
import Game from "./Game";
import Citizen from "./Citizen";

export default class Food extends ObjectWithPosition {
  class = "Food";
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

  getEatenBy(agent: Citizen | HQ) {
    this.eatenById = agent.id;
  }

  move(position: Position) {
    this.position.x = position.x;
    this.position.y = position.y;
  }

  toJSON() {
    return [this.id, this.position.x, this.position.y, this.eatenById];
  }

  static fromJSON(game: Game, json: any) {
    return new Food(game, {
      id: json[0],
      position: new Position(json[1], json[2]),
      eatenById: json[3]
    });
  }
}