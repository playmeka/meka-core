import Game, { Unit } from "./Game";
import Action from "./Action";
import Command from "./Command";
import Citizen from "./Citizen";

export default class PickUpFoodCommand extends Command {
  constructor(unit: Unit, args = {}) {
    super(unit, args);
  }

  getNextAction(game: Game): Action {
    const unit = this.unit as Citizen;
    if (!unit) return null;
    if (unit.hp <= 0) return null;
    if (unit.class !== "Citizen") return null;
    if (unit.food) return null;

    const { position } = this.args;
    const food = game.foods[position.key];

    if (!food || food.eatenBy) return null;
    if (food.eatenBy) return null;

    if (unit.position.isAdjacentTo(food.position)) {
      return position;
    } else {
      return position; // TODO: Return adjacent to the position
    }
  }
}
