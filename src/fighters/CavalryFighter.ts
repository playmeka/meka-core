import { Position } from "../ObjectWithPosition";
import Game, { Unit } from "../Game";
import BaseFighter, { BaseFighterJSON, BaseFighterProps } from "./BaseFighter";

export type CavalryFighterJSON = BaseFighterJSON & {
  className: "CavalryFighter";
};

export type CavalryFighterProps = BaseFighterProps;

export default class CavalryFighter extends BaseFighter {
  className: string = "CavalryFighter";
  game: Game;
  teamId: string;
  baseAttackDamage: number;
  hp: number;
  baseHP: number;
  speed: number;
  range: number;
  id: string;

  constructor(game: Game, props: CavalryFighterProps) {
    super(game, props);
    this.hp = props.hp || this.team.settings.baseHP["CavalryFighter"];
    this.baseHP = this.team.settings.baseHP["CavalryFighter"];
    this.baseAttackDamage = this.team.settings.baseAttackDamage[
      "CavalryFighter"
    ];
    this.range = this.team.settings.range["CavalryFighter"];
    this.speed = this.team.settings.speed["CavalryFighter"];
  }

  getAttackDamageFor(enemyUnit: Unit) {
    return enemyUnit.className === "RangedFighter"
      ? this.baseAttackDamage + 6
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
    } as CavalryFighterJSON;
  }

  static fromJSON(game: Game, json: CavalryFighterJSON) {
    const position = Position.fromJSON(json.position);
    return new CavalryFighter(game, { ...json, position });
  }
}
