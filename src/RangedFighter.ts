const uuidv4 = require("uuid/v4");
import ObjectWithPosition, {
  Position,
  PositionJSON
} from "./ObjectWithPosition";
import Game, { Agent } from "./Game";

export type RangedFighterJSON = {
  id: string;
  class: "RangedFighter";
  hp: number;
  teamId: string;
  position: PositionJSON;
  range: number;
  speed: number;
  cost: number;
};

type RangedFighterProps = {
  teamId: string;
  position: Position;
  id?: string;
};

export default class RangedFighter extends ObjectWithPosition {
  class: string = "RangedFighter";
  game: Game;
  teamId: string;
  baseAttackDamage: number;
  hp: number;
  speed: number;
  range: number;
  id: string;
  cost: number;

  constructor(game: Game, props: RangedFighterProps) {
    super(props);
    this.id = props.id || uuidv4();
    this.game = game;
    this.teamId = props.teamId;
    this.hp = 24;
    this.baseAttackDamage = 7;
    this.cost = 4;
    this.range = 3;
    this.speed = 1;
  }

  get team() {
    return this.game.getTeam(this.teamId);
  }

  get validMoves() {
    return this.position
      .adjacentsWithinDistance(this.speed)
      .filter(move => this.game.isValidPosition(move, this.team.id));
  }

  get validAttacks() {
    return this.position
      .adjacentsWithinDistance(this.range)
      .filter(move => this.game.isValidAttackPosition(move, this.team.id));
  }

  attackDamage(enemyAgent: Agent) {
    return enemyAgent.class === "RangedFighter"
      ? this.baseAttackDamage + 4
      : this.baseAttackDamage;
  }

  getPathTo(position: Position): Position[] {
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

  isValidAttack(position: Position) {
    return this.validAttacks.find(
      move => move.x == position.x && move.y == position.y
    );
  }

  toJSON() {
    const { id, hp, teamId, position, cost, speed, range } = this;
    return {
      id,
      class: this.class,
      hp,
      teamId,
      position: position.toJSON(),
      cost,
      speed,
      range
    } as RangedFighterJSON;
  }

  static fromJSON(game: Game, json: RangedFighterJSON) {
    const position = Position.fromJSON(json.position);
    return new RangedFighter(game, { ...json, position });
  }
}
