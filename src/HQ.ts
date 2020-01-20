const uuidv4 = require("uuid/v4");
import ObjectWithPosition from "./ObjectWithPosition";
import Team from "./Team";
import shuffle from "./utils/shuffle";

export default class HQ extends ObjectWithPosition {
  class: string = "HQ";
  hp: number = 100;
  team: Team;
  id: string;
  width: number;
  height: number;

  constructor(
    team: Team,
    props: {
      id?: string;
      width?: number;
      height?: number;
      position?: { x: number; y: number };
    } = {}
  ) {
    super(props);
    this.team = team;
    this.id = props.id || uuidv4();
    this.width = props.width || 2;
    this.height = props.height || 2;
  }

  get game() {
    return this.team.game;
  }

  takeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) this.die();
  }

  eatFood() {
    return this.team.addFood();
  }

  die() {
    this.game.killHQ(this);
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
    return false;
  }

  toJSON() {
    return [
      this.id,
      this.team.id,
      this.width,
      this.height,
      this.position.x,
      this.position.y
    ];
  }

  static fromJSON(team: Team, json: any) {
    return new HQ(team, {
      id: json[0],
      width: json[2],
      height: json[3],
      position: { x: json[4], y: json[5] }
    });
  }
}
