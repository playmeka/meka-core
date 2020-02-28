import { Position } from "../ObjectWithPosition";
import Game, { Unit } from "../Game";
import BaseFighter, { BaseFighterJSON, BaseFighterProps } from "./BaseFighter";

export type InfantryFighterJSON = BaseFighterJSON & {
  className: "InfantryFighter";
};

export type InfantryFighterProps = BaseFighterProps;

export default class InfantryFighter extends BaseFighter {
  className: string = "InfantryFighter";
  game: Game;
  teamId: string;
  baseAttackDamage: number;
  hp: number;
  baseHP: number;
  speed: number;
  range: number;
  id: string;

  constructor(game: Game, props: InfantryFighterProps) {
    super(game, props);
    this.hp = props.hp || this.team.settings.baseHP["InfantryFighter"];
    this.baseHP = this.team.settings.baseHP["InfantryFighter"];
    this.baseAttackDamage = this.team.settings.baseAttackDamage[
      "InfantryFighter"
    ];
    this.range = this.team.settings.range["InfantryFighter"];
    this.speed = this.team.settings.speed["InfantryFighter"];
  }

  getPathTo(position: Position): Position[] {
    return this.game.pathFinder.getPath(this, position);
  }

  getOptimalPathToTarget(target: Unit) {
    const attackPositions = this.getAttackPositionsFor(target);

    const allPaths: Position[][] = this.game.pathFinder.getPaths(
      this,
      attackPositions
    );

    if (allPaths.length > 0)
      return allPaths.reduce((a, b) => (a.length < b.length ? a : b));
    return null;
  }

  takeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) this.die();
  }

  die() {
    this.game.killFighter(this);
  }

  getAttackDamageFor(enemyUnit: Unit) {
    return enemyUnit.className === "CavalryFighter"
      ? this.baseAttackDamage + 5
      : this.baseAttackDamage;
  }

  toJSON() {
    return super.toJSON() as InfantryFighterJSON;
  }

  static fromJSON(game: Game, json: InfantryFighterJSON) {
    const position = Position.fromJSON(json.position);
    return new InfantryFighter(game, { ...json, position });
  }
}
