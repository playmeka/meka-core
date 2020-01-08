import { observable, action, computed } from "mobx";
import ObjectWithPosition, {
  Position,
  randomPosition
} from "./ObjectWithPosition";
import shuffle from "lodash/shuffle";

export default class HQ extends ObjectWithPosition {
  class = "HQ";

  @observable hp = 100;

  constructor(team, props = {}) {
    super(props);
    this.team = team;
    this.width = 2;
    this.height = 2;
  }

  @computed get battle() {
    return this.team.battle;
  }

  @action takeDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) this.die();
  }

  die() {
    this.battle.killHQ(this);
  }

  get positions() {
    return [
      new Position(this.x, this.y),
      new Position(this.x + 1, this.y),
      new Position(this.x, this.y + 1),
      new Position(this.x + 1, this.y + 1)
    ];
  }

  get nextSpawnPosition() {
    const options = shuffle(this.positions);
    for (let i = 0; i < options.length; i++) {
      const position = options[i];
      if (
        !this.team.battle.citizens[position.key] &&
        !this.team.battle.fighters[position.key]
      ) {
        return position;
      }
    }
    return false;
  }
}
