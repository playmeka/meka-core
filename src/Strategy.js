import { Action } from "./Battle";

export default class Strategy {
  constructor(battle, team) {
    this.battle = battle;
    this.team = team;
  }

  getNextActions(battle, team) {
    this.battle = battle;
    this.team = team;
    return [];
  }
}
