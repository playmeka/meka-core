import Game, { Unit, UnitJSON, Command } from "./Game";
import { CommandJSON, CommandArgs, CommandArgsJSON } from "./Command";
import { Position } from "./ObjectWithPosition";
import {
  MoveCommand,
  AttackCommand,
  SpawnCommand,
  DropOffFoodCommand,
  PickUpFoodCommand
} from "./commands";

export type ActionType =
  | "move"
  | "attack"
  | "spawn"
  | "pickUpFood"
  | "dropOffFood";

export type ActionStatus = "success" | "inprogress" | "failure";
export type ActionResponse = UnitJSON;
export type ActionJSON = {
  command: CommandJSON;
  status: ActionStatus;
  error?: string;
  response?: any;
  type: ActionType;
  unit: UnitJSON;
  args: CommandArgsJSON;
};
export type ActionProps = {
  command: Command;
  status: ActionStatus;
  error?: string;
  response?: ActionResponse;
  type: ActionType;
  unit: Unit;
  args: CommandArgs;
};

export default class Action {
  command: Command;
  status: ActionStatus;
  error?: string;
  response?: ActionResponse;
  type: ActionType;
  unit: Unit;
  args: CommandArgs;

  constructor(props: ActionProps) {
    this.command = props.command;
    this.status = props.status;
    this.error = props.error;
    this.response = props.response;
    this.type = props.type;
    this.unit = props.unit;
    this.args = props.args;
  }

  toJSON() {
    const { command, status, error, response, type, unit, args } = this;
    return {
      status,
      error,
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
    }[json.command[0]];

    const command = commandClass.fromJSON(game, json.command);
    const unit = game.lookup[json.unit.id] as Unit;
    let args = json.args || {};
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }
    return new Action({ ...json, command, unit, args: args as CommandArgs });
  }
}
