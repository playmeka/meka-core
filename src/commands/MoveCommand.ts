import Game, { Fighter, Unit, FighterJSON } from "../Game";
import Command from "../Command";
import { Position, PositionJSON } from "../ObjectWithPosition";
import Action from "../Action";
import Citizen, { CitizenJSON } from "../Citizen";

export type MoveCommandArgs = {
  position: Position;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
};

export type MoveCommandArgsJSON = {
  position?: PositionJSON;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
};

export type MoveCommandJSON = {
  className: "MoveCommand";
  id: string;
  unit: CitizenJSON | FighterJSON;
  args: MoveCommandArgs;
};

export default class MoveCommand extends Command {
  className: string = "MoveCommand";

  constructor(props: { unit: Unit; args?: MoveCommandArgs; id?: string }) {
    super(props);
  }

  getNextAction(game: Game): Action {
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
      path = game.getOptimalPathToTarget(unit, target);
    }

    if (!path) return null;
    // Take unit.speed steps at a time
    // Note: it is not unit.speed - 1 because PathFinder returns the unit
    // position as the first step in the path
    const newPosition = path[unit.speed] || path[path.length - 1];
    return new Action({
      command: this,
      type: "move",
      args: { ...this.args, position: newPosition },
      unit
    });
  }

  static fromJSON(game: Game, json: MoveCommandJSON) {
    const unit = game.lookup[json.unit.id] as Unit;
    let args = json.args;
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }

    return new MoveCommand({ ...json, unit, args });
  }
}
