import { v4 as uuidv4 } from "uuid";
import ObjectWithPosition, {
  Position,
  PositionJSON
} from "./ObjectWithPosition";
import Game from "./Game";
import isValidPosition from "./utils/isValidPosition";

export type FighterJSON = {
  id: string;
  class: "Fighter";
  hp: number;
  teamId: string;
  position: PositionJSON;
};

export type FighterProps = {
  teamId: string;
  position: Position;
  id?: string;
  hp?: number;
};

export default class Fighter extends ObjectWithPosition {
  class: string = "Fighter";
  game: Game;
  teamId: string;
  attackDamage: number = 5;
  hp: number = 20;
  id: string;

  constructor(game: Game, props: FighterProps) {
    super(props);
    this.game = game;
    this.teamId = props.teamId;
    this.id = props.id || uuidv4();
    this.hp = props.hp || 20;
  }

  get team() {
    return this.game.getTeam(this.teamId);
  }

  get validMoves() {
    return this.position.adjacents.filter(move =>
      isValidPosition(this.game, move, this.team.id)
    );
  }

  getPathTo(position: Position) {
    return this.game.pathFinder.getPath(this, position);
  }

  move(position: Position) {
    this.position = position;
  }

  takeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) this.die();
  }

  die() {
    this.game.killFighter(this);
  }

  isValidMove(position: Position) {
    return this.validMoves.find(
      move => move.x == position.x && move.y == position.y
    );
  }

  toJSON() {
    const { id, hp, teamId, position } = this;
    return {
      id,
      class: this.class,
      hp,
      teamId,
      position: position.toJSON()
    } as FighterJSON;
  }

  static fromJSON(game: Game, json: FighterJSON) {
    const position = Position.fromJSON(json.position);
    return new Fighter(game, { ...json, position });
  }
}
