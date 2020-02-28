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

export type PickUpFoodActionArgs = {
  position: Position;
};

export type PickUpFoodActionArgsJSON = {
  position: PositionJSON;
};

export type PickUpFoodActionJSON = BaseActionJSON & {
  args: PickUpFoodActionArgsJSON;
  className: "PickUpFoodAction";
};

export type PickUpFoodActionProps = BaseActionProps & {
  unit: Unit;
  args: PickUpFoodActionArgs;
};

export default class PickUpFoodAction extends BaseAction {
  className: string = "PickUpFoodAction";

  constructor(props: PickUpFoodActionProps) {
    super(props);
  }

  async execute(game: Game) {
    const unit = this.unit as Citizen;
    if (!unit) throw new Error("Unable to find unit with ID: " + this.unit.id);
    if (unit.hp <= 0) throw new Error("Unit is dead (HP is at or below 0)");
    if (unit.className !== "Citizen") throw new Error("Unit is not a citizen");
    if (unit.food) throw new Error("Unit already has food");

    const { position } = this.args;
    const food = game.foods[position.key];

    if (!food || food.eatenBy)
      throw new Error(
        "Unable to find food: " + JSON.stringify(position.toJSON())
      );

    if (food.eatenBy)
      throw new Error(
        "Food is already eaten by unit with ID: " + food.eatenById
      );

    if (unit.position.isAdjacentTo(food.position)) {
      this.handleFoodPickUp(game, unit, food.position);
      this.response = unit.toJSON();
      game.history.pushActions(game.turn, this);
      return this;
    } else {
      throw new Error("Unit is not adjacent to the food");
    }
  }

  import(game: Game) {
    this.handleFoodPickUp(game, this.unit as Citizen, this.args.position);
  }

  handleFoodPickUp(game: Game, unit: Citizen, position: Position) {
    const food = game.foods[position.key];
    delete game.foods[food.key]; // Un-register food
    food.move(unit.position);
    unit.eatFood(food);
    food.getEatenBy(unit);
  }

  static fromJSON(game: Game, json: PickUpFoodActionJSON) {
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
    const args: PickUpFoodActionArgs = { ...json.args, position };
    return new PickUpFoodAction({ ...json, command, unit, args });
  }
}
