import Game from "../Game";
import Citizen, { CitizenJSON } from "../Citizen";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { commandFromJSON, CommandJSON } from "../commands";
import BaseAction, { BaseActionProps } from "./BaseAction";

export type PickUpFoodActionArgs = {
  position: Position;
};

export type PickUpFoodActionArgsJSON = {
  position: PositionJSON;
};

export type PickUpFoodActionJSON = {
  args: PickUpFoodActionArgsJSON;
  className: "PickUpFoodAction";
  command: CommandJSON;
  response?: CitizenJSON;
  unit: CitizenJSON;
};

export type PickUpFoodActionProps = BaseActionProps & {
  unit: Citizen;
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

  toJSON() {
    const { command, response, unit, className, id } = this;

    const args = {
      position: this.args.position.toJSON()
    };

    return {
      id,
      className,
      response,
      command: command.toJSON(),
      unit: unit.toJSON(),
      args
    } as PickUpFoodActionJSON;
  }

  static fromJSON(game: Game, json: PickUpFoodActionJSON) {
    const command = commandFromJSON(game, json.command);
    const unit = game.lookup[json.unit.id] as Citizen;
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : undefined;
    const args: PickUpFoodActionArgs = { ...json.args, position };
    return new PickUpFoodAction({ ...json, command, unit, args });
  }
}
