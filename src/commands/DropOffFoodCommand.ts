import Game from "../Game";
import Command from "../Command";
import { Position, PositionJSON } from "../ObjectWithPosition";
import Action from "../Action";
import HQ from "../HQ";
import Citizen, { CitizenJSON } from "../Citizen";
import shuffle from "../utils/shuffle";

export type DropOffFoodCommandArgs = {
  position?: Position;
  hqId?: string;
};

export type DropOffFoodCommandArgsJSON = {
  position?: PositionJSON;
  hqId?: string;
};

export type DropOffFoodCommandJSON = {
  className: "DropOffFoodCommand";
  id: string;
  unit: CitizenJSON;
  args: DropOffFoodCommandArgsJSON;
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
    const food = unit.food;
    if (!unit) return null;
    if (unit.hp <= 0) return null;
    if (unit.className !== "Citizen") return null;
    if (!food) return null;

    const { position, hqId } = this.args;
    const hq = hqId ? (game.lookup[hqId] as HQ) : undefined;

    if (!hq && !position) return null;
    const dropOffPositions = hq ? hq.covering : [position];

    if (unit.position.isAdjacentToAny(dropOffPositions)) {
      const dropOffPosition = shuffle(dropOffPositions).find(position => {
        return (
          unit.position.isAdjacentTo(position) && food.isValidDropOff(position)
        );
      });
      if (dropOffPosition)
        return new Action({
          command: this,
          type: "dropOffFood",
          args: { position: dropOffPosition },
          unit
        });
      else return null;
    } else {
      // TODO: Abstract this logic in `getPathTo`
      const path = hq
        ? game.getOptimalPathToTarget(unit, hq)
        : unit.getPathTo(position);

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
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : null;
    const args: DropOffFoodCommandArgs = { ...json.args, position };

    return new DropOffFoodCommand({ ...json, unit, args });
  }
}
