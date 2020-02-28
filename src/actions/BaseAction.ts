import Game, { Unit, UnitJSON } from "../Game";
import { Position, PositionJSON } from "../ObjectWithPosition";
import {
  MoveCommand,
  AttackCommand,
  SpawnCommand,
  DropOffFoodCommand,
  PickUpFoodCommand,
  Command,
  CommandJSON
} from "../commands";
import { FighterClassName } from "../fighters";

export type BaseActionArgs = {
  position?: Position;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
};

export type BaseActionArgsJSON = {
  position?: PositionJSON;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
};

export type BaseActionResponse = UnitJSON;
export type BaseActionJSON = {
  command: CommandJSON;
  response?: any;
  unit: UnitJSON;
  args: BaseActionArgsJSON;
};
export type BaseActionProps = {
  command: Command;
  response?: BaseActionResponse;
  unit: Unit;
  args: BaseActionArgs;
};

export default class BaseAction {
  command: Command;
  response?: BaseActionResponse;
  unit: Unit;
  args: BaseActionArgs;
  className: string = "BaseAction";

  constructor(props: BaseActionProps) {
    this.command = props.command;
    this.response = props.response;
    this.unit = props.unit;
    this.args = props.args;
  }

  async execute(_game: Game): Promise<BaseAction> {
    return;
  }

  import(_game: Game) {}

  toJSON() {
    const { command, response, unit, args, className } = this;
    return {
      className,
      response,
      command: command.toJSON(),
      unit: unit.toJSON(),
      args
    };
  }

  static fromJSON(game: Game, json: BaseActionJSON) {
    const commandClass = {
      MoveCommand,
      AttackCommand,
      SpawnCommand,
      DropOffFoodCommand,
      PickUpFoodCommand
    }[json.command.className];

    // TODO: Handle commandJSON type
    const command = commandClass.fromJSON(game, json.command as any);
    const unit = game.lookup[json.unit.id] as Unit;
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : null;
    const args: BaseActionArgs = { ...json.args, position };
    return new BaseAction({ ...json, command, unit, args });
  }
}
