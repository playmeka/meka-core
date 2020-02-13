import { v4 as uuidv4 } from "uuid";
import Game, { FighterJSON } from "./Game";
import { CitizenJSON } from "./Citizen";
import { HQJSON } from "./HQ";
import Command, { CommandJSON } from "./Command";

export type ActionStatus = "success" | "failure"; // TODO: use numbers like HTTP?
export type ActionResponse = CitizenJSON | FighterJSON | HQJSON;
export type ActionJSON = {
  id: string;
  command: CommandJSON;
  status: ActionStatus;
  error?: string;
  response?: any;
};
export type ActionProps = {
  command: Command;
  status: ActionStatus;
  id?: string;
  error?: string;
  response?: ActionResponse;
};

export default class Action {
  id: string;
  command: Command;
  status: ActionStatus;
  error?: string;
  response?: ActionResponse;

  constructor(props: ActionProps) {
    this.id = props.id || uuidv4();
    this.command = props.command;
    this.status = props.status;
    this.error = props.error;
    this.response = props.response;
  }

  toJSON() {
    const { id, command, status, error, response } = this;
    return {
      id,
      status,
      error,
      response,
      command: command.toJSON()
    } as ActionJSON;
  }

  static fromJSON(game: Game, json: ActionJSON) {
    const command = Command.fromJSON(game, json.command);
    return new Action({ ...json, command });
  }
}
