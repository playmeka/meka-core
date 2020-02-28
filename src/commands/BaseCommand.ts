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

export type BaseCommandArgsJSON = {
  position?: PositionJSON;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
  unitType?: FighterClassName | "Citizen";
  targetId?: string;
  foodId?: string;
  hqId?: string;
};

export type BaseCommandJSON = {
  id: string;
  unit: UnitJSON;
  args: BaseCommandArgsJSON;
};

export default class BaseCommand {
  className: string = "BaseCommand";
  unit: Unit;
  args?: BaseCommandArgs;
  id: string;

  constructor(props: { unit: Unit; args?: BaseCommandArgs; id?: string }) {
    this.id = props.id || uuidv4();
    this.unit = props.unit;
    this.args = props.args || {};
  }

  getNextAction(_game: Game): Action {
    return null;
  }

  toJSON() {
    const { className, id, unit, args } = this;
    return {
      className,
      id,
      unit: unit.toJSON(),
      args
    };
  }

  static fromJSON(game: Game, json: BaseCommandJSON) {
    const unit = game.lookup[json.unit.id] as Unit;
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : null;
    const args: BaseCommandArgs = { ...json.args, position };
    return new BaseCommand({ ...json, unit, args });
  }
}
