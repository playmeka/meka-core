import Game from "../Game";
import BaseCommand, { BaseCommandJSON } from "./BaseCommand";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { DropOffFoodAction, MoveAction } from "../actions";
import HQ from "../HQ";
import Citizen from "../Citizen";
import shuffle from "../utils/shuffle";

export type DropOffFoodCommandArgs = {
  position?: Position;
  hqId?: string;
};

export type DropOffFoodCommandArgsJSON = {
  position?: PositionJSON;
  hqId?: string;
};

export type DropOffFoodCommandJSON = BaseCommandJSON & {
  className: "DropOffFoodCommand";
  args: DropOffFoodCommandArgsJSON;
};

export default class DropOffFoodCommand extends BaseCommand {
  className: string = "DropOffFoodCommand";

  constructor(props: {
    unit: Citizen;
    args?: DropOffFoodCommandArgs;
    id?: string;
  }) {
    super(props);
  }

  getNextAction(game: Game): DropOffFoodAction | MoveAction {
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
        return new DropOffFoodAction({
          command: this,
          args: { position: dropOffPosition },
          unit
        });
      else return null;
    } else {
      // TODO: Abstract this logic in `getPathTo`
      const path = hq
        ? unit.getOptimalPathToTarget(hq)
        : unit.getPathTo(position);

      if (!path) return null;

      // Take unit.speed steps at a time
      // Note: it is not unit.speed - 1 because PathFinder returns the unit
      // position as the first step in the path
      const newPosition = path[unit.speed] || path[path.length - 1];
      return new MoveAction({
        command: this,
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
