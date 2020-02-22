import { v4 as uuidv4 } from "uuid";
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

export type CommandJSON = [CommandClassName, string, string, CommandArgsJSON];

export default class Command {
  class: string = "Command";
  unit: Unit;
  args?: CommandArgs;
  id: string;

  constructor(props: { unit: Unit; args?: CommandArgs; id?: string }) {
    this.id = props.id || uuidv4();
    this.unit = props.unit;
    this.args = props.args || {};
  }

  getNextAction(_game: Game): Action {
    return null;
  }

  toJSON() {
    return [this.class, this.id, this.unit.id, this.args] as CommandJSON;
  }

  static fromJSON(game: Game, json: CommandJSON) {
    const unit = game.lookup[json[2]] as Unit;
    let args = json[3] || {};
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }

    return new Command({ ...json, unit, args: args as CommandArgs });
  }
}
