import Game, { Unit, UnitJSON } from "./Game";
import { Position, PositionJSON } from "./ObjectWithPosition";
import {
  MoveCommand,
  AttackCommand,
  SpawnCommand,
  DropOffFoodCommand,
  PickUpFoodCommand
} from "./commands";
import { Command, CommandJSON } from "./commands";
import { FighterClassName } from "./fighters";

export type ActionType =
  | "move"
  | "attack"
  | "spawn"
  | "pickUpFood"
  | "dropOffFood";

export type ActionArgs = {
  position?: Position;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
};

export type ActionArgsJSON = {
  position?: PositionJSON;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
};

export type ActionResponse = UnitJSON;
export type ActionJSON = {
  command: CommandJSON;
  response?: any;
  type: ActionType;
  unit: UnitJSON;
  args: ActionArgsJSON;
};
export type ActionProps = {
  command: Command;
  response?: ActionResponse;
  type: ActionType;
  unit: Unit;
  args: ActionArgs;
};

export default class Action {
  command: Command;
  response?: ActionResponse;
  type: ActionType;
  unit: Unit;
  args: ActionArgs;

  constructor(props: ActionProps) {
    this.command = props.command;
    this.response = props.response;
    this.type = props.type;
    this.unit = props.unit;
    this.args = props.args;
  }

  toJSON() {
    const { command, response, type, unit, args } = this;
    return {
      response,
      command: command.toJSON(),
      type,
      unit: unit.toJSON(),
      args
    } as ActionJSON;
  }

  static fromJSON(game: Game, json: ActionJSON) {
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
    let args = json.args || {};
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }
    return new Action({ ...json, command, unit, args: args as ActionArgs });
  }
}
