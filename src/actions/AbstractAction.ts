import { v4 as uuidv4 } from "uuid";
import Game, { Unit, UnitJSON } from "../Game";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { Command, CommandJSON } from "../commands";
import { FighterClassName } from "../fighters";

export type AbstractActionArgs = {
  position?: Position;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
  id?: string;
};

export type AbstractActionProps = {
  command: Command;
  response?: UnitJSON;
  unit: Unit;
  args: AbstractActionArgs;
  id?: string;
};

export type AbstractActionJSON = {
  args: AbstractActionArgsJSON;
  className: string;
  command: CommandJSON;
  response?: UnitJSON;
  unit: UnitJSON;
};

export type AbstractActionArgsJSON = {
  position?: PositionJSON;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
  id?: string;
};

export default abstract class AbstractAction {
  id: string;
  command: Command;
  response?: UnitJSON;
  unit: Unit;
  args: AbstractActionArgs;
  className: string = "AbstractAction";

  constructor(props: AbstractActionProps) {
    this.id = props.id || uuidv4();
    this.command = props.command;
    this.response = props.response;
    this.unit = props.unit;
    this.args = props.args;
  }

  abstract async execute(game: Game): Promise<void>;

  abstract import(game: Game): void;

  abstract toJSON(): AbstractActionJSON;
}
