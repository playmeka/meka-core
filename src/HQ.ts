const uuidv4 = require("uuid/v4");
import ObjectWithPosition, { Position } from "./ObjectWithPosition";
import Game from "./Game";
import shuffle from "./utils/shuffle";

export default class HQ extends ObjectWithPosition {
  class: string = "HQ";
  hp: number = 100;
  teamId: string;
  id: string;
  width: number;
  height: number;
  game: Game;

  constructor(
    game: Game,
    props: {
      teamId: string;
      id?: string;
      width?: number;
      height?: number;
      position: Position;
    }
  ) {
    super(props);
    this.game = game;
    this.teamId = props.teamId;
    this.id = props.id || uuidv4();
    this.width = props.width || 2;
    this.height = props.height || 2;
  }

  get team() {
    return this.game.getTeam(this.teamId);
  }

  takeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) this.die();
  }

  eatFood() {
    return this.team.addFood();
  }

  die() {
    this.game.killHQ(this);
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

  static fromJSON(game: Game, json: any) {
    return new HQ(game, {
      id: json[0],
      teamId: json[1],
      width: json[2],
      height: json[3],
      position: new Position(json[4], json[5])
    });
  }
}
