import Game from "../Game";
import Command, { CommandJSON, CommandArgs } from "../Command";
import { Position } from "../ObjectWithPosition";
import Action from "../Action";
import Citizen from "../Citizen";

export default class PickUpFoodCommand extends Command {
  className: string = "PickUpFoodCommand";

  constructor(props: { unit: Citizen; args?: CommandArgs; id?: string }) {
    super(props);
  }

  getNextAction(game: Game): Action {
    const unit = this.unit as Citizen;
    if (!unit) return null;
    if (unit.hp <= 0) return null;
    if (unit.className !== "Citizen") return null;
    if (unit.food) return null;

    const { position } = this.args;
    const food = game.foods[position.key];

    if (!food || food.eatenBy) return null;
    if (food.eatenBy) return null;

    if (unit.position.isAdjacentTo(food.position)) {
      return new Action({
        command: this,
        type: "pickUpFood",
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

  static fromJSON(game: Game, json: CommandJSON) {
    const unit = game.lookup[json.unit.id] as Citizen;
    let args = json.args || {};
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }

    return new Command({ ...json, unit, args: args as CommandArgs });
  }
}
