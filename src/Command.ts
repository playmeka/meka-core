import Game, { Unit, FighterType } from "./Game";
import { Position, PositionJSON } from "./ObjectWithPosition";

export type CommandType =
  | "move"
  | "attack"
  | "spawn"
  | "pickUpFood"
  | "dropOffFood";
export type CommandJSON = [
  string,
  CommandType,
  {
    position?: PositionJSON;
    autoPickUpFood?: boolean;
    autoDropOffFood?: boolean;
    unitType?: FighterType | "Citizen";
    targetId?: string;
  }
];

export default class Command {
  unit: Unit;
  type: CommandType;
  args?: {
    position?: Position;
    autoPickUpFood?: boolean;
    autoDropOffFood?: boolean;
    unitType?: FighterType | "Citizen";
    targetId?: string;
  };

  constructor(Unit: Unit, commandType: CommandType, args = {}) {
    this.unit = Unit;
    this.type = commandType;
    this.args = args;
  }

  toJSON() {
    return [this.unit.id, this.type, this.args] as CommandJSON;
  }

  static fromJSON(game: Game, json: CommandJSON) {
    const unit = game.lookup[json[0]] as Unit;
    const args = json[2] || {};
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }
    return new Command(unit, json[1], args);
  }
}
