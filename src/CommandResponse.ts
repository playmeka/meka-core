import { CommandJSON } from "./Command";
import Game, { Command } from "./Game";
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
};
export type CommandResponseJSON = {
  command: CommandJSON;
  action?: ActionJSON;
  status: CommandResponseStatus;
};

export default class CommandResponse {
  command: Command;
  status: CommandResponseStatus;
  action?: Action;

  constructor(props: CommandResponseProps) {
    this.command = props.command;
    this.status = props.status;
    this.action = props.action || null;
  }

  toJSON() {
    const { command, status, action } = this;
    return {
      status,
      command: command.toJSON(),
      action: action.toJSON()
    } as CommandResponseJSON;
  }

  static fromJSON(game: Game, json: CommandResponseJSON) {
    const commandClass = {
      MoveCommand,
      AttackCommand,
      SpawnCommand,
      DropOffFoodCommand,
      PickUpFoodCommand
    }[json.command[0]];

    const command = commandClass.fromJSON(game, json.command);
    const action = Action.fromJSON(game, json.action);
    return new CommandResponse({ ...json, command, action });
  }
}
