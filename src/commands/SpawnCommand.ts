import Game, { FighterType } from "../Game";
import Command from "../Command";
import { Position, PositionJSON } from "../ObjectWithPosition";
import Action from "../Action";
import HQ, { HQJSON } from "../HQ";

export type SpawnCommandArgs = {
  position?: Position;
  unitType: FighterType | "Citizen";
};

export type SpawnCommandArgsJSON = {
  position?: PositionJSON;
  unitType: FighterType | "Citizen";
};

export type SpawnCommandJSON = {
  className: "SpawnCommand";
  id: string;
  unit: HQJSON;
  args: SpawnCommandArgsJSON;
};

export default class SpawnCommand extends Command {
  className: string = "SpawnCommand";

  constructor(props: { unit: HQ; args?: SpawnCommandArgs; id?: string }) {
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

  static fromJSON(game: Game, json: SpawnCommandJSON) {
    const unit = game.lookup[json.unit.id] as HQ;
    let args = json.args as SpawnCommandArgs;
    if (args.position) {
      args.position = Position.fromJSON(args.position);
    }

    return new SpawnCommand({ ...json, unit, args });
  }
}
