import { v4 as uuidv4 } from "uuid";
import ObjectWithPosition, {
  Position,
  PositionJSON
} from "./ObjectWithPosition";
import Game, { Unit } from "./Game";
import shuffle from "./utils/shuffle";
import isTargetAtPosition from "./utils/isTargetAtPosition";

export type HQJSON = {
  id: string;
  className: "HQ";
  hp: number;
  teamId: string;
  width: number;
  height: number;
  position: PositionJSON;
  baseAttackDamage: number;
  range: number;
};

type HQProps = {
  teamId: string;
  position: Position;
  id?: string;
  width?: number;
  height?: number;
  hp?: number;
};

export default class HQ extends ObjectWithPosition {
  className: string = "HQ";
  hp: number = 500;
  baseAttackDamage: number = 6;
  range: number = 3;
  teamId: string;
  id: string;
  game: Game;
  baseHP: number;

  constructor(game: Game, props: HQProps) {
    super(props);
    this.game = game;
    this.teamId = props.teamId;
    this.id = props.id || uuidv4();
    this.width = props.width || 2;
    this.height = props.height || 2;
    this.hp = props.hp || this.team.baseHP("HQ");
    this.baseHP = this.team.baseHP("HQ");
    this.baseAttackDamage = this.team.baseAttackDamage("HQ");
    this.range = this.team.range("HQ");
  }

  get team() {
    return this.game.getTeam(this.teamId);
  }

  takeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) this.die();
  }

  eatFood() {
    return this.team.addFood();
  }

  die() {
    // TODO
  }

  getAttackDamageFor(_enemyUnit: Unit) {
    return this.baseAttackDamage;
  }

  get nextSpawnPosition() {
    const options = shuffle(this.covering);
    for (let i = 0; i < options.length; i++) {
      const position = options[i];
      if (
        !this.team.game.citizens[position.key] &&
        !this.team.game.fighters[position.key]
      ) {
        return position;
      }
    }
    return null;
  }

  validAttackPositionsWithTargets(target: Unit) {
    let possiblePositions = this.covering.map(position =>
      position
        .adjacentsWithinDistance(this.range)
        .filter(move =>
          isTargetAtPosition(this.game, move, target, this.team.id)
        )
    );

    return possiblePositions.reduce((acc, val) => acc.concat(val), []);
  }

  isValidAttack(target: Unit, position: Position) {
    return this.validAttackPositionsWithTargets(target).find(
      move => move.x == position.x && move.y == position.y
    );
  }

  toJSON() {
    const {
      id,
      teamId,
      width,
      height,
      hp,
      position,
      range,
      baseAttackDamage
    } = this;
    return {
      id,
      teamId,
      width,
      height,
      hp,
      range,
      baseAttackDamage,
      position: position.toJSON()
    } as HQJSON;
  }

  static fromJSON(game: Game, json: HQJSON) {
    const position = Position.fromJSON(json.position);
    return new HQ(game, { ...json, position });
  }
}
