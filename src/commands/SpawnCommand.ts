import Game from "../Game";
import BaseCommand, { BaseCommandJSON } from "./BaseCommand";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { SpawnAction } from "../actions";
import HQ, { HQJSON } from "../HQ";
import { FighterClassName } from "../fighters";

export type SpawnCommandArgs = {
  position?: Position;
  unitType: FighterClassName | "Citizen";
};

export type SpawnCommandArgsJSON = {
  position?: PositionJSON;
  unitType: FighterClassName | "Citizen";
};

export type SpawnCommandJSON = BaseCommandJSON & {
  className: "SpawnCommand";
  unit: HQJSON;
  args: SpawnCommandArgsJSON;
};

export default class SpawnCommand extends BaseCommand {
  className: string = "SpawnCommand";

  constructor(props: { unit: HQ; args?: SpawnCommandArgs; id?: string }) {
    super(props);
  }

  getNextAction(_game: Game): SpawnAction {
    const { unit, args } = this;
    if (unit.hp <= 0) return null;

    const position = this.args.position || (unit as HQ).nextSpawnPosition;
    if (!position) return null;
    if (!args.unitType) return null;

    if (!unit.covering.find(hqPosition => hqPosition.isEqualTo(position)))
      return null;

    return new SpawnAction({
      command: this,
      args: { position, unitType: args.unitType },
      unit
    });
  }

  static fromJSON(game: Game, json: SpawnCommandJSON) {
    const unit = game.lookup[json.unit.id] as HQ;
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : null;
    const args: SpawnCommandArgs = { ...json.args, position };
    return new SpawnCommand({ ...json, unit, args });
  }
}
