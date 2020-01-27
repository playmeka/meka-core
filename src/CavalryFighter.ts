const uuidv4 = require("uuid/v4");
import BaseFighter from "./BaseFighter";
import { Position } from "./ObjectWithPosition";
import Team from "./Team";

export default class CavalryFighter extends BaseFighter {
  class: string = "CavalryFighter";

  constructor(team: Team, props: { id?: string; position: Position }) {
    super(team, props);
    this.id = props.id || uuidv4();
    this.team = team;
    this.baseAttackDamage = 5;
    this.hp = 20;
    this.speed = 2;
    this.range = 1;
  }

  get validMoves() {
    return this.position.adjacents.filter(move =>
      this.game.isValidPosition(move, this.team.id)
    );
  }

  attackDamage(enemyAgent: any) {
    console.log(enemyAgent);
    return this.baseAttackDamage;
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
    return new CavalryFighter(team, { ...json, position });
  }
}
