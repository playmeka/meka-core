import Game, { Unit } from "../Game";
import Citizen, { CitizenProps, CitizenJSON } from "../Citizen";
import HQ, { HQJSON } from "../HQ";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { commandFromJSON, CommandJSON } from "../commands";
import BaseAction, { BaseActionProps } from "./BaseAction";
import {
  FighterProps,
  FighterClassName,
  CavalryFighter,
  RangedFighter,
  InfantryFighter,
  FighterJSON
} from "../fighters";

export type SpawnActionArgs = {
  position: Position;
};

export type SpawnActionArgsJSON = {
  position: PositionJSON;
};

export type SpawnActionJSON = {
  args: SpawnActionArgsJSON;
  className: "SpawnAction";
  command: CommandJSON;
  response?: CitizenJSON | FighterJSON;
  unit: HQJSON;
};

export type SpawnActionProps = BaseActionProps & {
  unit: Unit;
  args: SpawnActionArgs;
};

export default class SpawnAction extends BaseAction {
  className: string = "SpawnAction";

  constructor(props: SpawnActionProps) {
    super(props);
  }

  async execute(game: Game) {
    const { unit } = this;
    if (unit.hp <= 0) throw new Error("HQ is dead (HP is at or below 0)");
    const position = this.args.position || (unit as HQ).nextSpawnPosition;
    if (!position) throw new Error("No position available for spawn");
    if (!unit.covering.find(hqPosition => hqPosition.isEqualTo(position)))
      throw new Error("Invalid position: " + JSON.stringify(position.toJSON()));

    if (this.args.unitType == "Citizen") {
      const newCitizen = this.spawnCitizen(game, unit as HQ, { position });
      this.response = newCitizen.toJSON();
      game.history.pushActions(game.turn, this);
    } else {
      const newFighter = this.spawnFighter(
        game,
        unit as HQ,
        this.args.unitType,
        {
          position
        }
      );
      this.response = newFighter.toJSON();
      game.history.pushActions(game.turn, this);
    }
  }

  import(game: Game) {
    const hq = this.unit as HQ;
    const position = Position.fromJSON(this.response.position);
    if (this.args.unitType === "Citizen") {
      this.spawnCitizen(game, hq, { ...this.response, position });
    } else {
      this.spawnFighter(game, hq, this.args.unitType, {
        ...this.response,
        position
      });
    }
  }

  spawnCitizen(game: Game, hq: HQ, props: Partial<CitizenProps>) {
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

  spawnFighter(
    game: Game,
    hq: HQ,
    fighterType: FighterClassName,
    props: Partial<FighterProps>
  ) {
    const { team } = hq;
    if (team.pop >= game.maxPop) {
      throw new Error("Population cap reached");
    }

    const fighterClass = { CavalryFighter, RangedFighter, InfantryFighter }[
      fighterType
    ];
    const newFighter = new fighterClass(game, {
      ...props,
      teamId: team.id
    } as FighterProps);

    if (team.foodCount < team.settings.cost[fighterType]) {
      throw new Error("Not enough food to pay for spawn");
    }
    team.spendFood(team.settings.cost[fighterType]);
    game.addFighter(newFighter);
    return newFighter;
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
    } as SpawnActionJSON;
  }

  static fromJSON(game: Game, json: SpawnActionJSON) {
    const command = commandFromJSON(game, json.command);
    const unit = game.lookup[json.unit.id] as Unit;
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : undefined;
    const args: SpawnActionArgs = { ...json.args, position };
    return new SpawnAction({ ...json, command, unit, args });
  }
}
