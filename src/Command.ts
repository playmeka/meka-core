import Game, { Unit, FighterType } from "./Game";
import Action from "./Action";
import { Position, PositionJSON } from "./ObjectWithPosition";

export type CommandJSON = [
  string,
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
  args?: {
    position?: Position;
    autoPickUpFood?: boolean;
    autoDropOffFood?: boolean;
    unitType?: FighterType | "Citizen";
    targetId?: string;
  };

  constructor(Unit: Unit, args = {}) {
    this.unit = Unit;
    this.args = args;
  }

  getNextAction(_game: Game): Action {
    return null;
  }

  toJSON() {
    return [this.unit.id, this.args] as CommandJSON;
  }

  static fromJSON(game: Game, json: CommandJSON) {
    const unit = game.lookup[json[0]] as Unit;
    const args = json[1] || {};
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }
    return new Command(unit, args);
  }
}
