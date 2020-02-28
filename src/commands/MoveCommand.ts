import Game, { Unit } from "../Game";
import BaseCommand, { BaseCommandJSON } from "./BaseCommand";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { MoveAction } from "../actions";
import Citizen, { CitizenJSON } from "../Citizen";
import { Fighter, FighterJSON } from "../fighters";

export type MoveCommandArgs = {
  position: Position;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
};

export type MoveCommandArgsJSON = {
  position: PositionJSON;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
};

export type MoveCommandJSON = BaseCommandJSON & {
  className: "MoveCommand";
  unit: CitizenJSON | FighterJSON;
  args: MoveCommandArgsJSON;
};

export default class MoveCommand extends BaseCommand {
  className: string = "MoveCommand";

  constructor(props: { unit: Unit; args?: MoveCommandArgs; id?: string }) {
    super(props);
  }

  getNextAction(game: Game): MoveAction {
    const unit = this.unit as Citizen | Fighter;
    if (!unit) return null;
    if (unit.hp <= 0) return null;
    const { position, targetId } = this.args;
    const target = game.lookup[targetId] as Unit;

    if (!position && !target)
      throw new Error("No target or position passed to move towards");

    let path;
    if (position) {
      path = game.pathFinder.getPath(unit, position);
    } else {
      path = unit.getOptimalPathToTarget(target);
    }

    if (!path) return null;
    // Take unit.speed steps at a time
    // Note: it is not unit.speed - 1 because PathFinder returns the unit
    // position as the first step in the path
    const newPosition = path[unit.speed] || path[path.length - 1];
    return new MoveAction({
      command: this,
      args: { ...this.args, position: newPosition },
      unit
    });
  }

  static fromJSON(game: Game, json: MoveCommandJSON) {
    const unit = game.lookup[json.unit.id] as Unit;
    const position = Position.fromJSON(json.args.position);
    const args: MoveCommandArgs = { ...json.args, position };
    return new MoveCommand({ ...json, unit, args });
  }
}
