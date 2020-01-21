import { Agent } from "./Game";

export type ActionType = "move" | "attack" | "spawnCitizen" | "spawnFighter";

export default class Action {
  agent: Agent;
  type: ActionType;
  args?: Object;

  constructor(agent: Agent, actionType: ActionType, args = {}) {
    this.agent = agent;
    this.type = actionType;
    this.args = args;
  }

  toJSON() {
    return [this.agent.id, this.type, this.args];
  }

  static fromJSON(game: Game, json: any) {
    const agent = game.lookup[json[0]];
    return new Action(agent, json[1], json[2]);
  }
}
