const uuidv4 = require("uuid/v4");
import ObjectWithPosition, { Position } from "./ObjectWithPosition";
import Team from "./Team";

export default class Fighter extends ObjectWithPosition {
  class: string = "Fighter";
  attackDamage: number = 5;
  hp: number = 20;
  team: Team;
  id: string;

  constructor(
    team: Team,
    props: { id?: string; team?: Team; x?: number; y?: number } = {}
  ) {
    super(props);
    this.id = props.id || uuidv4();
    this.team = team;
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

  get game() {
    return this.team.game;
  }

  move(position: Position) {
    this.position.x = position.x;
    this.position.y = position.y;
  }

  takeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) this.die();
  }

  die() {
    this.game.killFighter(this);
  }
}
