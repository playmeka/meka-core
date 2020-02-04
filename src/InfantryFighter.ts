const uuidv4 = require("uuid/v4");
import ObjectWithPosition, {
  Position,
  PositionJSON
} from "./ObjectWithPosition";
import Game, { Agent } from "./Game";

export type InfantryFighterJSON = {
  id: string;
  class: "InfantryFighter";
  hp: number;
  teamId: string;
  position: PositionJSON;
  range: number;
  speed: number;
  cost: number;
};

type InfantryFighterProps = {
  teamId: string;
  position: Position;
  id?: string;
};

export default class InfantryFighter extends ObjectWithPosition {
  class: string = "InfantryFighter";
  game: Game;
  teamId: string;
  baseAttackDamage: number;
  hp: number;
  speed: number;
  range: number;
  id: string;
  cost: number;

  constructor(game: Game, props: InfantryFighterProps) {
    super(props);
    this.game = game;
    this.teamId = props.teamId;
    this.id = props.id || uuidv4();
    this.hp = 32;
    this.baseAttackDamage = 10;
    this.cost = 4;
    this.range = 1;
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
    return enemyAgent.class === "CavalryFighter"
      ? this.baseAttackDamage + 5
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
    } as InfantryFighterJSON;
  }

  static fromJSON(game: Game, json: InfantryFighterJSON) {
    const position = Position.fromJSON(json.position);
    return new InfantryFighter(game, { ...json, position });
  }
}
