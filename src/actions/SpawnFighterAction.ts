import Game from "../Game";
import HQ, { HQJSON } from "../HQ";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { commandFromJSON, CommandJSON } from "../commands";
import AbstractAction, { AbstractActionProps } from "./AbstractAction";
import {
  FighterJSON,
  FighterProps,
  FighterClassName,
  CavalryFighter,
  RangedFighter,
  InfantryFighter
} from "../fighters";

export type SpawnFighterActionArgs = {
  unitType: FighterClassName;
  position: Position;
};

export type SpawnFighterActionArgsJSON = {
  unitType: FighterClassName;
  position: PositionJSON;
};

export type SpawnFighterActionJSON = {
  args: SpawnFighterActionArgsJSON;
  className: "SpawnFighterAction";
  command: CommandJSON;
  response?: FighterJSON;
  unit: HQJSON;
};

export type SpawnFighterActionProps = AbstractActionProps & {
  unit: HQ;
  args: SpawnFighterActionArgs;
};

export default class SpawnFighterAction extends AbstractAction {
  className: string = "SpawnFighterAction";

  constructor(props: SpawnFighterActionProps) {
    super(props);
  }

  async execute(game: Game) {
    const { unit } = this;
    if (unit.hp <= 0) throw new Error("HQ is dead (HP is at or below 0)");
    const position = this.args.position || (unit as HQ).nextSpawnPosition;
    if (!position) throw new Error("No position available for spawn");
    if (!unit.covering.find(hqPosition => hqPosition.isEqualTo(position)))
      throw new Error("Invalid position: " + JSON.stringify(position.toJSON()));

    const newFighter = this.mutateGame(
      game,
      unit as HQ,
      this.args.unitType as FighterClassName,
      {
        position
      }
    );
    this.response = newFighter.toJSON();
    game.history.pushActions(game.turn, this);
  }

  import(game: Game) {
    const hq = this.unit as HQ;
    const position = Position.fromJSON(this.response.position);
    this.mutateGame(game, hq, this.args.unitType as FighterClassName, {
      ...this.response,
      position
    });
  }

  mutateGame(
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
    } as SpawnFighterActionJSON;
  }

  static fromJSON(game: Game, json: SpawnFighterActionJSON) {
    const command = commandFromJSON(game, json.command);
    const unit = game.lookup[json.unit.id] as HQ;
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : undefined;
    const args: SpawnFighterActionArgs = { ...json.args, position };
    return new SpawnFighterAction({ ...json, command, unit, args });
  }
}
