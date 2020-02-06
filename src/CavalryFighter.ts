import { v4 as uuidv4 } from "uuid";
import ObjectWithPosition, {
  Position,
  PositionJSON
} from "./ObjectWithPosition";
import Game, { Agent } from "./Game";
import isValidPosition from "./utils/isValidPosition";
import isValidAttackPosition from "./utils/isValidAttackPosition";

export type CavalryFighterJSON = {
  id: string;
  class: "CavalryFighter";
  hp: number;
  teamId: string;
  position: PositionJSON;
  range: number;
  speed: number;
  cost: number;
};

export type CavalryFighterProps = {
  teamId: string;
  position: Position;
  id?: string;
  hp?: number;
};

export default class CavalryFighter extends ObjectWithPosition {
  class: string = "CavalryFighter";
  game: Game;
  teamId: string;
  baseAttackDamage: number;
  hp: number;
  speed: number;
  range: number;
  id: string;
  cost: number;

  constructor(game: Game, props: CavalryFighterProps) {
    super(props);
    this.id = props.id || uuidv4();
    this.game = game;
    this.teamId = props.teamId;
    this.hp = props.hp || 30;
    this.baseAttackDamage = 6;
    this.cost = 3;
    this.range = 1;
    this.speed = 2;
  }

  get team() {
    return this.game.getTeam(this.teamId);
  }

  get validMoves() {
    return this.position
      .adjacentsWithinDistance(this.speed)
      .filter(move => isValidPosition(this.game, move, this.team.id));
  }

  get validAttacks() {
    return this.position
      .adjacentsWithinDistance(this.range)
      .filter(move => isValidAttackPosition(this.game, move, this.team.id));
  }

  attackDamage(enemyAgent: Agent) {
    return enemyAgent.class === "RangedFighter"
      ? this.baseAttackDamage + 6
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
    } as CavalryFighterJSON;
  }

  static fromJSON(game: Game, json: CavalryFighterJSON) {
    const position = Position.fromJSON(json.position);
    return new CavalryFighter(game, { ...json, position });
  }
}
