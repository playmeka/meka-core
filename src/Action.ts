import Game, { Agent } from "./Game";
import { Position } from "./ObjectWithPosition";

export type ActionType = "move" | "attack" | "spawnCitizen" | "spawnFighter";

export default class Action {
  agent: Agent;
  type: ActionType;
  args?: { position?: Position };

  constructor(agent: Agent, actionType: ActionType, args = {}) {
    this.agent = agent;
    this.type = actionType;
    this.args = args;
  }

  toJSON() {
    return [this.agent.id, this.type, this.args];
  }

  static fromJSON(game: Game, json: Array<any>) {
    const agent = game.lookup[json[0]] as Agent;
    return new Action(agent, json[1], json[2]);
  }
}
