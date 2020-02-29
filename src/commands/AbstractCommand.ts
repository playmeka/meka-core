import { v4 as uuidv4 } from "uuid";
import Game, { Unit, UnitJSON } from "../Game";
import { Action } from "../actions";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { FighterClassName } from "../fighters";

export type AbstractCommandArgs = {
  position?: Position;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
  foodId?: string;
  hqId?: string;
};

export type AbstractCommandJSON = {
  id: string;
  className: string;
  unit: UnitJSON;
  args: AbstractCommandArgsJSON;
};

export type AbstractCommandArgsJSON = {
  position?: PositionJSON;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
  foodId?: string;
  hqId?: string;
};

export default abstract class AbstractCommand {
  className: string = "AbstractCommand";
  unit: Unit;
  args?: AbstractCommandArgs;
  id: string;

  constructor(props: { unit: Unit; args?: AbstractCommandArgs; id?: string }) {
    this.id = props.id || uuidv4();
    this.unit = props.unit;
    this.args = props.args || {};
  }

  abstract getNextAction(game: Game): Action;

  abstract toJSON(): AbstractCommandJSON;
}
