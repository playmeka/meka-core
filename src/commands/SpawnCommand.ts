import Game, { Unit } from "../Game";
import Command, { CommandJSON } from "../Command";
import { Position } from "../ObjectWithPosition";
import Action from "../Action";
import HQ from "../HQ";

export default class SpawnCommand extends Command {
  constructor(unit: Unit, args = {}) {
    super(unit, args);
  }

  getNextAction(_game: Game): Action {
    const { unit, args } = this;
    if (unit.hp <= 0) return null;

    const position = this.args.position || (unit as HQ).nextSpawnPosition;
    if (!position) return null;
    if (!args.unitType) return null;

    if (!unit.covering.find(hqPosition => hqPosition.isEqualTo(position)))
      return null;

    return new Action({
      command: this,
      type: "spawn",
      status: "inprogress",
      args: { position, unitType: args.unitType },
      unit
    });
  }

  static fromJSON(game: Game, json: CommandJSON) {
    const unit = game.lookup[json[1]] as Unit;
    let args = json[2] || {};
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }

    return new SpawnCommand(unit, args);
  }
}
