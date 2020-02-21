import Game, { Unit } from "./Game";
import Command from "./Command";
import Citizen from "./Citizen";
import Action from "./Action";

export default class DropOffFoodCommand extends Command {
  constructor(unit: Unit, args = {}) {
    super(unit, args);
  }

  getNextAction(_game: Game): Action {
    const unit = this.unit as Citizen;
    if (!unit) return null;
    if (unit.hp <= 0) return null;
    if (unit.class !== "Citizen") return null;
    if (!unit.food) return null;
    const { position } = this.args;
    const food = unit.food;

    if (unit.position.isAdjacentTo(position)) {
      if (!food.isValidDropOff(position)) return null;

      return position;
    } else {
      return position;
    }
  }
}
