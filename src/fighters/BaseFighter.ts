import { v4 as uuidv4 } from "uuid";
import ObjectWithPosition, {
  Position,
  PositionJSON
} from "../ObjectWithPosition";
import Game, { Unit } from "../Game";
import isValidPosition from "../utils/isValidPosition";
import isTargetAtPosition from "../utils/isTargetAtPosition";

export type BaseFighterJSON = {
  id: string;
  className: "BaseFighter";
  hp: number;
  teamId: string;
  position: PositionJSON;
  range: number;
  speed: number;
  baseHP: number;
};

export type BaseFighterProps = {
  teamId: string;
  position: Position;
  id?: string;
  hp?: number;
};

export default class BaseFighter extends ObjectWithPosition {
  game: Game;
  teamId: string;
  baseAttackDamage: number;
  hp: number;
  baseHP: number;
  speed: number;
  range: number;
  id: string;

  constructor(game: Game, props: BaseFighterProps) {
    super(props);
    this.id = props.id || uuidv4();
    this.game = game;
    this.teamId = props.teamId;
  }

  get team() {
    return this.game.getTeam(this.teamId);
  }

  get validMoves() {
    return this.position
      .adjacentsWithinDistance(this.speed)
      .filter(move => isValidPosition(this.game, move, this.teamId));
  }

  validAttackPositionsWithTargets(target: Unit) {
    return this.position
      .adjacentsWithinDistance(this.range)
      .filter(move => isTargetAtPosition(this.game, move, target, this.teamId));
  }

  getAttackDamageFor(_enemyUnit: Unit) {
    return 0;
  }

  move(position: Position) {
    this.position = position;
  }

  isValidMove(position: Position) {
    return this.validMoves.find(
      move => move.x == position.x && move.y == position.y
    );
  }

  isValidAttack(target: Unit, position: Position) {
    return this.validAttackPositionsWithTargets(target).find(
      move => move.x == position.x && move.y == position.y
    );
  }

  getAttackPositionsFor(enemyUnit: Unit) {
    const positionMap: { [key: string]: Position } = {};
    enemyUnit.covering.forEach(position => {
      position.adjacentsWithinDistance(this.range).forEach(attackPosition => {
        positionMap[attackPosition.key] = attackPosition;
      });
    });
    return Object.values(positionMap);
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
    } as BaseFighterJSON;
  }

  static fromJSON(game: Game, json: BaseFighterJSON) {
    const position = Position.fromJSON(json.position);
    return new BaseFighter(game, { ...json, position });
  }
}
