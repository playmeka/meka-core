import { Position } from "../ObjectWithPosition";
import Game, { Unit } from "../Game";
import AbstractFighter, {
  AbstractFighterJSON,
  AbstractFighterProps
} from "./AbstractFighter";

export type InfantryFighterJSON = AbstractFighterJSON & {
  className: "InfantryFighter";
};

export type InfantryFighterProps = AbstractFighterProps;

export default class InfantryFighter extends AbstractFighter {
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
    this.hp =
      props.hp >= 0 ? props.hp : this.team.settings.baseHP["InfantryFighter"];
    this.baseHP = this.team.settings.baseHP["InfantryFighter"];
    this.baseAttackDamage = this.team.settings.baseAttackDamage[
      "InfantryFighter"
    ];
    this.range = this.team.settings.range["InfantryFighter"];
    this.speed = this.team.settings.speed["InfantryFighter"];
  }

  getAttackDamageFor(enemyUnit: Unit) {
    return enemyUnit.className === "CavalryFighter"
      ? this.baseAttackDamage + 5
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
    } as InfantryFighterJSON;
  }

  takeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) this.die();
  }

  die() {
    this.game.killFighter(this);
  }

  static fromJSON(game: Game, json: InfantryFighterJSON) {
    const position = Position.fromJSON(json.position);
    return new InfantryFighter(game, { ...json, position });
  }
}
