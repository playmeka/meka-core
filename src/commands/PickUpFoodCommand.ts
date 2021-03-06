import Game from "../Game";
import AbstractCommand from "./AbstractCommand";
import { PickUpFoodAction, MoveCitizenAction } from "../actions";
import Citizen, { CitizenJSON } from "../Citizen";
import Food from "../Food";

export type PickUpFoodCommandArgs = {
  foodId: string;
};

export type PickUpFoodCommandArgsJSON = {
  foodId: string;
};

export type PickUpFoodCommandJSON = {
  id: string;
  unit: CitizenJSON;
  className: "PickUpFoodCommand";
  args: PickUpFoodCommandArgsJSON;
};

export default class PickUpFoodCommand extends AbstractCommand {
  className: string = "PickUpFoodCommand";

  constructor(props: {
    unit: Citizen;
    args?: PickUpFoodCommandArgs;
    id?: string;
  }) {
    super(props);
  }

  getNextAction(game: Game): PickUpFoodAction | MoveCitizenAction {
    const unit = this.unit as Citizen;
    if (!unit) return null;
    if (unit.hp <= 0) return null;
    if (unit.className !== "Citizen") return null;
    if (unit.food) return null;

    const food = game.lookup[this.args.foodId] as Food;
    if (!food || food.eatenBy) return null;

    if (unit.position.isAdjacentTo(food.position)) {
      return new PickUpFoodAction({
        command: this,
        args: { position: food.position },
        unit
      });
    } else {
      const path = game.pathFinder.getPath(unit, food.position);

      if (!path) return null;

      // Take unit.speed steps at a time
      // Note: it is not unit.speed - 1 because PathFinder returns the unit
      // position as the first step in the path
      const newPosition = path[unit.speed] || path[path.length - 1];
      return new MoveCitizenAction({
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

  toJSON() {
    const { className, id, unit, args } = this;

    return {
      className,
      id,
      unit: unit.toJSON(),
      args
    } as PickUpFoodCommandJSON;
  }

  static fromJSON(game: Game, json: PickUpFoodCommandJSON) {
    const unit = game.lookup[json.unit.id] as Citizen;
    return new PickUpFoodCommand({ ...json, unit });
  }
}
