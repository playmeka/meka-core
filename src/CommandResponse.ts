import { Command, CommandJSON } from "./commands";
import Game from "./Game";
import Action, { ActionJSON } from "./Action";
import {
  MoveCommand,
  AttackCommand,
  SpawnCommand,
  DropOffFoodCommand,
  PickUpFoodCommand
} from "./commands";

export type CommandResponseStatus = "success" | "failure";
export type CommandResponseProps = {
  command: Command;
  status: CommandResponseStatus;
  action?: Action;
  error?: string;
};
export type CommandResponseJSON = {
  command: CommandJSON;
  action?: ActionJSON;
  status: CommandResponseStatus;
  error?: string;
};

export default class CommandResponse {
  command: Command;
  status: CommandResponseStatus;
  action?: Action;
  error?: string;

  constructor(props: CommandResponseProps) {
    this.command = props.command;
    this.status = props.status;
    this.action = props.action || null;
    this.error = props.error;
  }

  toJSON() {
    const { command, status, action, error } = this;
    return {
      status,
      command: command.toJSON(),
      action: action ? action.toJSON() : undefined,
      error
    } as CommandResponseJSON;
  }

  static fromJSON(game: Game, json: CommandResponseJSON) {
    const commandClass = {
      MoveCommand,
      AttackCommand,
      SpawnCommand,
      DropOffFoodCommand,
      PickUpFoodCommand
    }[json.command.className];

    // TODO: Handle commandJSON type
    const command = commandClass.fromJSON(game, json.command as any);
    const action = Action.fromJSON(game, json.action);
    return new CommandResponse({ ...json, command, action });
  }
}
