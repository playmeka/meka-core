import { v4 as uuidv4 } from "uuid";
import Game from "./Game";
import Command, { CommandJSON } from "./Command";

export type ActionStatus = "success" | "failure"; // TODO: use numbers like HTTP?
export type ActionJSON = {
  id: string;
  command: CommandJSON;
  status: ActionStatus;
  error?: string;
  mutation?: any;
};
export type ActionProps = {
  command: Command;
  status: ActionStatus;
  id?: string;
  error?: string;
  mutation?: any; // TODO
};

export default class Action {
  id: string;
  command: Command;
  status: ActionStatus;
  error?: string;
  mutation?: any; // TODO

  constructor(props: ActionProps) {
    this.id = props.id || uuidv4();
    this.command = props.command;
    this.status = props.status;
    this.error = props.error;
    this.mutation = props.mutation;
  }

  toJSON() {
    const { id, command, status, error, mutation } = this;
    return {
      id,
      status,
      error,
      mutation,
      command: command.toJSON()
    } as ActionJSON;
  }

  static fromJSON(game: Game, json: ActionJSON) {
    const command = Command.fromJSON(game, json.command);
    return new Action({ ...json, command });
  }
}
