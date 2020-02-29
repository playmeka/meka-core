import { v4 as uuidv4 } from "uuid";
import Game, { Unit, UnitJSON } from "../Game";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { Command, CommandJSON } from "../commands";
import { FighterClassName } from "../fighters";

export type BaseActionArgs = {
  position?: Position;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
  id?: string;
};

export type BaseActionProps = {
  command: Command;
  response?: UnitJSON;
  unit: Unit;
  args: BaseActionArgs;
  id?: string;
};

export type BaseActionJSON = {
  args: BaseActionArgsJSON;
  className: string;
  command: CommandJSON;
  response?: UnitJSON;
  unit: UnitJSON;
};

export type BaseActionArgsJSON = {
  position?: PositionJSON;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
  id?: string;
};

export default abstract class BaseAction {
  id: string;
  command: Command;
  response?: UnitJSON;
  unit: Unit;
  args: BaseActionArgs;
  className: string = "BaseAction";

  constructor(props: BaseActionProps) {
    this.id = props.id || uuidv4();
    this.command = props.command;
    this.response = props.response;
    this.unit = props.unit;
    this.args = props.args;
  }

  abstract async execute(game: Game): Promise<void>;

  abstract import(game: Game): void;

  abstract toJSON(): BaseActionJSON;
}
