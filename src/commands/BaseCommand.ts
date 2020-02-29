import { v4 as uuidv4 } from "uuid";
import Game, { Unit, UnitJSON } from "../Game";
import { Action } from "../actions";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { FighterClassName } from "../fighters";

export type BaseCommandArgs = {
  position?: Position;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
  foodId?: string;
  hqId?: string;
};

export type BaseCommandJSON = {
  id: string;
  className: string;
  unit: UnitJSON;
  args: BaseCommandArgsJSON;
};

export type BaseCommandArgsJSON = {
  position?: PositionJSON;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
  foodId?: string;
  hqId?: string;
};

export default abstract class BaseCommand {
  className: string = "BaseCommand";
  unit: Unit;
  args?: BaseCommandArgs;
  id: string;

  constructor(props: { unit: Unit; args?: BaseCommandArgs; id?: string }) {
    this.id = props.id || uuidv4();
    this.unit = props.unit;
    this.args = props.args || {};
  }

  abstract getNextAction(game: Game): Action;

  abstract toJSON(): BaseCommandJSON;
}
