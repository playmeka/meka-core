import Game from "../Game";
import Citizen, { CitizenProps, CitizenJSON } from "../Citizen";
import HQ, { HQJSON } from "../HQ";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { commandFromJSON, CommandJSON } from "../commands";
import BaseAction, { BaseActionProps } from "./BaseAction";

export type SpawnCitizenActionArgs = {
  position: Position;
  unitType: "Citizen";
};

export type SpawnCitizenActionArgsJSON = {
  position: PositionJSON;
  unitType: "Citizen";
};

export type SpawnCitizenActionJSON = {
  args: SpawnCitizenActionArgsJSON;
  className: "SpawnCitizenAction";
  command: CommandJSON;
  response?: CitizenJSON;
  unit: HQJSON;
};

export type SpawnCitizenActionProps = BaseActionProps & {
  unit: HQ;
  args: SpawnCitizenActionArgs;
};

export default class SpawnCitizenAction extends BaseAction {
  className: string = "SpawnCitizenAction";

  constructor(props: SpawnCitizenActionProps) {
    super(props);
  }

  async execute(game: Game) {
    const { unit } = this;
    if (unit.hp <= 0) throw new Error("HQ is dead (HP is at or below 0)");
    const position = this.args.position || (unit as HQ).nextSpawnPosition;
    if (!position) throw new Error("No position available for spawn");
    if (!unit.covering.find(hqPosition => hqPosition.isEqualTo(position)))
      throw new Error("Invalid position: " + JSON.stringify(position.toJSON()));

    const newCitizen = this.mutateGame(game, unit as HQ, { position });
    this.response = newCitizen.toJSON();
    game.history.pushActions(game.turn, this);
  }

  import(game: Game) {
    const hq = this.unit as HQ;
    const position = Position.fromJSON(this.response.position);
    this.mutateGame(game, hq, { ...this.response, position });
  }

  mutateGame(game: Game, hq: HQ, props: Partial<CitizenProps>) {
    const { team } = hq;
    if (team.pop >= game.maxPop) {
      throw new Error("Population cap reached");
    }
    const newCitizen = new Citizen(game, {
      ...props,
      teamId: team.id
    } as CitizenProps);

    if (team.foodCount < team.settings.cost["Citizen"]) {
      throw new Error("Not enough food to pay for spawn");
    }
    team.spendFood(team.settings.cost["Citizen"]);
    game.addCitizen(newCitizen);
    return newCitizen;
  }

  toJSON() {
    const { command, response, unit, className, id } = this;

    const args = {
      ...this.args,
      position: this.args.position.toJSON()
    };

    return {
      id,
      className,
      response,
      command: command.toJSON(),
      unit: unit.toJSON(),
      args
    } as SpawnCitizenActionJSON;
  }

  static fromJSON(game: Game, json: SpawnCitizenActionJSON) {
    const command = commandFromJSON(game, json.command);
    const unit = game.lookup[json.unit.id] as HQ;
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : undefined;
    const args: SpawnCitizenActionArgs = { ...json.args, position };
    return new SpawnCitizenAction({ ...json, command, unit, args });
  }
}
