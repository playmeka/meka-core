import Game, { Unit } from "./Game";
import Command from "./Command";
import HQ from "./HQ";
import Action from "./Action";

export default class SpawnCommand extends Command {
  constructor(unit: Unit, args = {}) {
    super(unit, args);
  }

  getNextAction(_game: Game): Action {
    const { unit } = this;
    if (unit.hp <= 0) throw new Error("HQ is dead (HP is at or below 0)");
    const position = this.args.position || (unit as HQ).nextSpawnPosition;
    if (!position) throw new Error("No position available for spawn");
    if (!unit.covering.find(hqPosition => hqPosition.isEqualTo(position)))
      throw new Error("Invalid position: " + JSON.stringify(position.toJSON()));

    return position;
  }
}
