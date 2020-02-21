import { v4 as uuidv4 } from "uuid";
import Game, { Unit, UnitJSON } from "./Game";
import Command, { CommandJSON } from "./Command";

export type ActionType =
  | "move"
  | "attack"
  | "spawn"
  | "pickUpFood"
  | "dropOffFood";

export type ActionStatus = "success" | "failure";
export type ActionResponse = UnitJSON;
export type ActionJSON = {
  id: string;
  command: CommandJSON;
  status: ActionStatus;
  error?: string;
  response?: any;
  type: ActionType;
  args: any;
  unit: UnitJSON;
};
export type ActionProps = {
  command: Command;
  status: ActionStatus;
  id?: string;
  error?: string;
  response?: ActionResponse;
  type: ActionType;
  unit: Unit;
  args: any;
};

export default class Action {
  id: string;
  command: Command;
  status: ActionStatus;
  error?: string;
  response?: ActionResponse;
  type: ActionType;
  unit: Unit;
  args: any;

  constructor(props: ActionProps) {
    this.id = props.id || uuidv4();
    this.command = props.command;
    this.status = props.status;
    this.error = props.error;
    this.response = props.response;
    this.type = props.type;
    this.unit = props.unit;
    this.args = props.args;
  }

  toJSON() {
    const { id, command, status, error, response, type, unit, args } = this;
    return {
      id,
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
    const command = Command.fromJSON(game, json.command);
    const unit = game.lookup[json.unit.id] as Unit;
    return new Action({ ...json, command, unit });
  }
}
