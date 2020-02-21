import { v4 as uuidv4 } from "uuid";
import Game from "./Game";
import Command, { CommandJSON } from "./Command";
import Action, { ActionJSON } from "./Action";

export type CommandResponseStatus = "success" | "failure";
export type CommandResponseJSON = {
  id: string;
  command: CommandJSON;
  status: CommandResponseStatus;
  action?: ActionJSON;
};
export type CommandResponseProps = {
  id?: string;
  command: Command;
  status: CommandResponseStatus;
  action?: Action;
};

export default class CommandResponse {
  id: string;
  command: Command;
  status: CommandResponseStatus;
  action?: Action;

  constructor(props: CommandResponseProps) {
    this.id = props.id || uuidv4();
    this.command = props.command;
    this.status = props.status;
    this.action = props.action;
  }

  toJSON() {
    const { id, command, status, action } = this;
    return {
      id,
      status,
      action: action ? action.toJSON() : null,
      command: command.toJSON()
    } as CommandResponseJSON;
  }

  static fromJSON(game: Game, json: CommandResponseJSON) {
    // TODO: Parse the right type of Command
    const command = Command.fromJSON(game, json.command);
    const action = json.action ? Action.fromJSON(game, json.action) : null;
    return new CommandResponse({ ...json, command, action });
  }
}
