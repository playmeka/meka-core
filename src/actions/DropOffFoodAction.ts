import Game, { Unit } from "../Game";
import Citizen from "../Citizen";
import { Position, PositionJSON } from "../ObjectWithPosition";
import {
  MoveCommand,
  AttackCommand,
  SpawnCommand,
  DropOffFoodCommand,
  PickUpFoodCommand
} from "../commands";
import BaseAction, { BaseActionProps, BaseActionJSON } from "./BaseAction";

export type DropOffFoodActionArgs = {
  position: Position;
};

export type DropOffFoodActionArgsJSON = {
  position: PositionJSON;
};

export type DropOffFoodActionJSON = BaseActionJSON & {
  args: DropOffFoodActionArgsJSON;
  className: "DropOffFoodAction";
};

export type DropOffFoodActionProps = BaseActionProps & {
  unit: Unit;
  args: DropOffFoodActionArgs;
};

export default class DropOffFoodAction extends BaseAction {
  className: string = "DropOffFoodAction";

  constructor(props: DropOffFoodActionProps) {
    super(props);
  }

  async execute(game: Game) {
    const unit = this.unit as Citizen;
    if (!unit) throw new Error("Unable to find unit with ID: " + this.unit.id);
    if (unit.hp <= 0) throw new Error("Unit is dead (HP is at or below 0)");
    if (unit.className !== "Citizen") throw new Error("Unit is not a citizen");
    if (!unit.food) throw new Error("Unit does not have food to drop off");
    const { position } = this.args;
    const food = unit.food;

    if (unit.position.isAdjacentTo(position)) {
      if (!food.isValidDropOff(position))
        throw new Error(
          "Invalid drop-off position: " + JSON.stringify(position.toJSON())
        );

      this.handleFoodDropOff(game, unit, position);
      this.response = unit.toJSON();
      game.history.pushActions(game.turn, this);
      return this;
    } else {
      throw new Error("Unit is not adjacent to the food");
    }
  }

  import(game: Game) {
    this.handleFoodDropOff(game, this.unit as Citizen, this.args.position);
  }

  handleFoodDropOff(game: Game, unit: Citizen, position: Position) {
    const food = unit.food;
    const hq = game.hqs[position.key];
    unit.dropOffFood();
    if (hq) {
      hq.eatFood();
      food.getEatenBy(hq);
    } else {
      food.eatenById = null;
      food.move(position);
      game.foods[position.key] = food;
    }
  }

  static fromJSON(game: Game, json: DropOffFoodActionJSON) {
    const commandClass = {
      MoveCommand,
      AttackCommand,
      SpawnCommand,
      DropOffFoodCommand,
      PickUpFoodCommand
    }[json.command.className];

    // TODO: Handle commandJSON type
    const command = commandClass.fromJSON(game, json.command as any);
    const unit = game.lookup[json.unit.id] as Unit;
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : null;
    const args: DropOffFoodActionArgs = { ...json.args, position };
    return new DropOffFoodAction({ ...json, command, unit, args });
  }
}
