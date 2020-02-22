import Command from "./Command";
import Action from "./Action";

export type CommandResponseStatus = "success" | "failure";
export type CommandResponseProps = {
  command: Command;
  status: CommandResponseStatus;
  action?: Action;
};

export default class CommandResponse {
  command: Command;
  status: CommandResponseStatus;
  action?: Action;

  constructor(props: CommandResponseProps) {
    this.command = props.command;
    this.status = props.status;
    this.action = props.action;
  }

  // TODO: Add standard fromJSON and toJSON
}
