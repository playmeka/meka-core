import { v4 as uuidv4 } from "uuid";
import ObjectWithPosition, {
  Position,
  PositionJSON
} from "./ObjectWithPosition";
import Game from "./Game";
import shuffle from "./utils/shuffle";

export type HQJSON = {
  id: string;
  class: "HQ";
  hp: number;
  teamId: string;
  width: number;
  height: number;
  position: PositionJSON;
};

type HQProps = {
  teamId: string;
  position: Position;
  id?: string;
  width?: number;
  height?: number;
};

export default class HQ extends ObjectWithPosition {
  class: string = "HQ";
  hp: number = 100;
  teamId: string;
  id: string;
  game: Game;

  constructor(game: Game, props: HQProps) {
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
    return null;
  }

  toJSON() {
    const { id, teamId, width, height, hp, position } = this;
    return {
      id,
      teamId,
      width,
      height,
      hp,
      position: position.toJSON()
    } as HQJSON;
  }

  static fromJSON(game: Game, json: HQJSON) {
    const position = Position.fromJSON(json.position);
    return new HQ(game, { ...json, position });
  }
}
