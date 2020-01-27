const uuidv4 = require("uuid/v4");
import ObjectWithPosition, { Position } from "./ObjectWithPosition";
import Team from "./Team";

export default class RangedFighter extends ObjectWithPosition {
  class: string = "RangedFighter";
  attackDamage: number = 5;
  hp: number = 20;
  team: Team;
  id: string;

  constructor(team: Team, props: { id?: string; position: Position }) {
    super(props);
    this.id = props.id || uuidv4();
    this.team = team;
  }

  get validMoves() {
    return this.position.adjacents.filter(move =>
      this.game.isValidPosition(move, this.team.id)
    );
  }

  get game() {
    return this.team.game;
  }

  getPathTo(position: Position) {
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

  toJSON() {
    return {
      id: this.id,
      class: this.class,
      hp: this.hp,
      team: { id: this.team.id },
      position: { x: this.x, y: this.y }
    };
  }

  static fromJSON(team: Team, json: any) {
    const position = Position.fromJSON(json.position);
    return new Fighter(team, { ...json, position });
  }
}
