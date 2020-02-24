import Game from "../Game";
import Command from "../Command";
import { Position, PositionJSON } from "../ObjectWithPosition";
import Action from "../Action";
import Citizen, { CitizenJSON } from "../Citizen";

export type DropOffFoodCommandArgs = {
  position: Position;
};

export type DropOffFoodCommandArgsJSON = {
  position: PositionJSON;
};

export type DropOffFoodCommandJSON = {
  className: "DropOffFoodCommand";
  id: string;
  unit: CitizenJSON;
  args: DropOffFoodCommandArgs;
};

export default class DropOffFoodCommand extends Command {
  className: string = "DropOffFoodCommand";

  constructor(props: {
    unit: Citizen;
    args?: DropOffFoodCommandArgs;
    id?: string;
  }) {
    super(props);
  }

  getNextAction(game: Game): Action {
    const unit = this.unit as Citizen;
    if (!unit) return null;
    if (unit.hp <= 0) return null;
    if (unit.className !== "Citizen") return null;
    if (!unit.food) return null;
    const { position } = this.args;
    const food = unit.food;

    if (unit.position.isAdjacentTo(position)) {
      if (!food.isValidDropOff(position)) return null;

      return new Action({
        command: this,
        type: "dropOffFood",
        args: { position },
        unit
      });
    } else {
      const path = game.pathFinder.getPath(unit, position);

      if (!path) return null;

      // Take unit.speed steps at a time
      // Note: it is not unit.speed - 1 because PathFinder returns the unit
      // position as the first step in the path
      const newPosition = path[unit.speed] || path[path.length - 1];
      return new Action({
        command: this,
        type: "move",
        args: {
          position: newPosition,
          autoPickUpFood: false,
          autoDropOffFood: false
        },
        unit
      });
    }
  }

  static fromJSON(game: Game, json: DropOffFoodCommandJSON) {
    const unit = game.lookup[json.unit.id] as Citizen;
    let args = json.args;
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }

    return new DropOffFoodCommand({ ...json, unit, args });
  }
}
