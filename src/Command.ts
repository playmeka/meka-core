import { v4 as uuidv4 } from "uuid";
import Game, { Unit, FighterType, UnitJSON } from "./Game";
import Action from "./Action";
import { Position, PositionJSON } from "./ObjectWithPosition";
import MoveCommand, { MoveCommandJSON } from "./commands/MoveCommand";
import AttackCommand, { AttackCommandJSON } from "./commands/AttackCommand";
import SpawnCommand, { SpawnCommandJSON } from "./commands/SpawnCommand";
import DropOffFoodCommand, {
  DropOffFoodCommandJSON
} from "./commands/DropOffFoodCommand";
import PickUpFoodCommand, {
  PickUpFoodCommandJSON
} from "./commands/PickUpFoodCommand";

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

export type CommandChildClass =
  | MoveCommand
  | AttackCommand
  | SpawnCommand
  | DropOffFoodCommand
  | PickUpFoodCommand;

export type CommandJSON =
  | MoveCommandJSON
  | AttackCommandJSON
  | SpawnCommandJSON
  | DropOffFoodCommandJSON
  | PickUpFoodCommandJSON;

export type CommandClassJSON = {
  className: CommandClassName;
  id: string;
  unit: UnitJSON;
  args: CommandArgsJSON;
};

export default class Command {
  className: string = "Command";
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
    const { className, id, unit, args } = this;
    return {
      className,
      id,
      unit: unit.toJSON(),
      args
    };
  }

  static fromJSON(game: Game, json: CommandClassJSON) {
    const unit = game.lookup[json.unit.id] as Unit;
    const args = json.args || {};
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }

    return new Command({ ...json, unit, args: args as CommandArgs });
  }
}
