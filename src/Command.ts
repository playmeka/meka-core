import Game, { Agent, FighterType } from "./Game";
import { Position, PositionJSON } from "./ObjectWithPosition";

export type CommandType =
  | "move"
  | "attack"
  | "spawnCitizen"
  | "spawnFighter"
  | "pickUpFood"
  | "dropOffFood";
export type CommandJSON = [
  string,
  CommandType,
  {
    position?: PositionJSON;
    autoPickUpFood?: boolean;
    autoDropOffFood?: boolean;
    fighterType?: FighterType;
    target?: Agent;
  }
];

export default class Command {
  agent: Agent;
  type: CommandType;
  args?: {
    position?: Position;
    autoPickUpFood?: boolean;
    autoDropOffFood?: boolean;
    fighterType?: FighterType;
    target?: Agent;
  };

  constructor(agent: Agent, commandType: CommandType, args = {}) {
    this.agent = agent;
    this.type = commandType;
    this.args = args;
  }

  toJSON() {
    return [this.agent.id, this.type, this.args] as CommandJSON;
  }

  static fromJSON(game: Game, json: CommandJSON) {
    const agent = game.lookup[json[0]] as Agent;
    const args = json[2] || {};
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }
    return new Command(agent, json[1], args);
  }
}
