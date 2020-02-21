import Game, { Fighter, Unit } from "./Game";
import Command from "./Command";
import Action from "./Action";
import HQ from "./HQ";

export default class AttackCommand extends Command {
  constructor(unit: Unit, args = {}) {
    super(unit, args);
  }

  getNextAction(game: Game): Action {
    const { targetId } = this.args;
    const target = game.lookup[targetId] as Unit;
    const unit = this.unit as Fighter | HQ;

    if (!target) return null;
    if (target.hp <= 0) return null;
    if (unit.hp <= 0) return null;

    const isTargetInRange = target.covering.some(position =>
      unit.isValidAttack(target, position)
    );

    if (isTargetInRange) {
      return target;
    } else if (unit.class === "HQ") {
      return null;
    } else {
      return target;
    }
  }
}
