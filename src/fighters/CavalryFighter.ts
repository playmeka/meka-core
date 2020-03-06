import { Position } from "../ObjectWithPosition";
import Game, { Unit } from "../Game";
import AbstractFighter, {
  AbstractFighterJSON,
  AbstractFighterProps
} from "./AbstractFighter";

export type CavalryFighterJSON = AbstractFighterJSON & {
  className: "CavalryFighter";
};

export type CavalryFighterProps = AbstractFighterProps;

export default class CavalryFighter extends AbstractFighter {
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

  takeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) this.die();
  }

  die() {
    this.game.killFighter(this);
  }

  static fromJSON(game: Game, json: CavalryFighterJSON) {
    const position = Position.fromJSON(json.position);
    return new CavalryFighter(game, { ...json, position });
  }
}
