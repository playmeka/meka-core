import Game from "../Game";
import Command, { CommandJSON, CommandArgs } from "../Command";
import { Position } from "../ObjectWithPosition";
import Action from "../Action";
import HQ from "../HQ";

export default class SpawnCommand extends Command {
  className: string = "SpawnCommand";

  constructor(props: { unit: HQ; args?: CommandArgs; id?: string }) {
    super(props);
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
      args: { position, unitType: args.unitType },
      unit
    });
  }

  static fromJSON(game: Game, json: CommandJSON) {
    const unit = game.lookup[json.unit.id] as HQ;
    let args = json.args || {};
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }

    return new SpawnCommand({ ...json, unit, args: args as CommandArgs });
  }
}
