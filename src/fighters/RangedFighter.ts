import { Position } from "../ObjectWithPosition";
import Game, { Unit } from "../Game";
import BaseFighter, { BaseFighterJSON, BaseFighterProps } from "./BaseFighter";

export type RangedFighterJSON = BaseFighterJSON & {
  className: "RangedFighter";
};

export type RangedFighterProps = BaseFighterProps;

export default class RangedFighter extends BaseFighter {
  className: string = "RangedFighter";
  game: Game;
  teamId: string;
  baseAttackDamage: number;
  hp: number;
  baseHP: number;
  speed: number;
  range: number;
  id: string;

  constructor(game: Game, props: RangedFighterProps) {
    super(game, props);
    this.hp = props.hp || this.team.settings.baseHP["RangedFighter"];
    this.baseHP = this.team.settings.baseHP["RangedFighter"];
    this.baseAttackDamage = this.team.settings.baseAttackDamage[
      "RangedFighter"
    ];
    this.range = this.team.settings.range["RangedFighter"];
    this.speed = this.team.settings.speed["RangedFighter"];
  }

  getAttackDamageFor(enemyUnit: Unit) {
    return enemyUnit.className === "InfantryFighter"
      ? this.baseAttackDamage + 4
      : this.baseAttackDamage;
  }

  toJSON() {
    const { id, hp, teamId, position, speed, range, className, baseHP } = this;
    return {
      id,
      className,
      hp,
      teamId,
      position: position.toJSON(),
      speed,
      range,
      baseHP
    } as RangedFighterJSON;
  }

  static fromJSON(game: Game, json: RangedFighterJSON) {
    const position = Position.fromJSON(json.position);
    return new RangedFighter(game, { ...json, position });
  }
}
