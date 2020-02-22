import Game, { Unit, FighterType } from "./Game";
import Action from "./Action";
import { Position, PositionJSON } from "./ObjectWithPosition";

export type CommandArgs = {
  position?: Position;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterType | "Citizen";
  targetId?: string;
};

export type CommandArgsJSON = {
  position?: PositionJSON;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterType | "Citizen";
  targetId?: string;
};

export type CommandClassName =
  | "MoveCommand"
  | "AttackCommand"
  | "SpawnCommand"
  | "DropOffFoodCommand"
  | "PickUpFoodCommand";

export type CommandJSON = [CommandClassName, string, CommandArgsJSON];

export default class Command {
  class: string = "Command";
  unit: Unit;
  args?: CommandArgs;

  constructor(unit: Unit, args = {}) {
    this.unit = unit;
    this.args = args;
  }

  getNextAction(_game: Game): Action {
    return null;
  }

  toJSON() {
    return [this.class, this.unit.id, this.args] as CommandJSON;
  }

  static fromJSON(game: Game, json: CommandJSON) {
    const unit = game.lookup[json[1]] as Unit;
    let args = json[2] || {};
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }

    return new Command(unit, args);
  }
}
