import { v4 as uuidv4 } from "uuid";
import ObjectWithPosition, {
  Position,
  PositionJSON
} from "../ObjectWithPosition";
import Game, { Unit } from "../Game";
import isInBounds from "../utils/isInBounds";
import isValidPosition from "../utils/isValidPosition";
import isTargetAtPosition from "../utils/isTargetAtPosition";

export type AbstractFighterJSON = {
  id: string;
  className: string;
  hp: number;
  teamId: string;
  position: PositionJSON;
  range: number;
  speed: number;
  baseHP: number;
};

export type AbstractFighterProps = {
  teamId: string;
  position: Position;
  id?: string;
  hp?: number;
};

export default abstract class AbstractFighter extends ObjectWithPosition {
  game: Game;
  teamId: string;
  baseAttackDamage: number;
  hp: number;
  baseHP: number;
  speed: number;
  range: number;
  id: string;
  className: string = "AbstractFighter";

  constructor(game: Game, props: AbstractFighterProps) {
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
        if (isInBounds(this.game, attackPosition))
          positionMap[attackPosition.key] = attackPosition;
      });
    });
    return Object.values(positionMap);
  }

  getPathTo(position: Position): Position[] {
    return this.game.pathFinder.getPath(this, position);
  }

  getPathToTarget(target: Unit) {
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

  abstract toJSON(): AbstractFighterJSON;

  abstract getAttackDamageFor(enemyUnit: Unit): number;
}
