import { v4 as uuidv4 } from "uuid";
import ObjectWithPosition, {
  Position,
  PositionJSON
} from "./ObjectWithPosition";
import Game, { Agent } from "./Game";
import isValidPosition from "./utils/isValidPosition";
import isValidAttackPosition from "./utils/isValidAttackPosition";

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

export type RangedFighterProps = {
  teamId: string;
  position: Position;
  id?: string;
  hp?: number;
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
    this.hp = props.hp || 24;
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
      .filter(move => isValidPosition(this.game, move, this.team.id));
  }

  validAttacks(target: Agent) {
    return this.position
      .adjacentsWithinDistance(this.range)
      .filter(move =>
        isValidAttackPosition(this.game, move, target, this.team.id)
      );
  }

  attackDamage(enemyAgent: Agent) {
    return enemyAgent.class === "InfantryFighter"
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

  isValidAttack(target: Agent, position: Position) {
    return this.validAttacks(target).find(
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
