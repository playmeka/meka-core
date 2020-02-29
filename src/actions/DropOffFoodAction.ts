import Game from "../Game";
import Citizen, { CitizenJSON } from "../Citizen";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { commandFromJSON, CommandJSON } from "../commands";
import AbstractAction, { AbstractActionProps } from "./AbstractAction";

export type DropOffFoodActionArgs = {
  position: Position;
};

export type DropOffFoodActionArgsJSON = {
  position: PositionJSON;
};

export type DropOffFoodActionJSON = {
  args: DropOffFoodActionArgsJSON;
  className: "DropOffFoodAction";
  command: CommandJSON;
  response?: CitizenJSON;
  unit: CitizenJSON;
};

export type DropOffFoodActionProps = AbstractActionProps & {
  unit: Citizen;
  args: DropOffFoodActionArgs;
};

export default class DropOffFoodAction extends AbstractAction {
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
    } as DropOffFoodActionJSON;
  }

  static fromJSON(game: Game, json: DropOffFoodActionJSON) {
    const command = commandFromJSON(game, json.command);
    const unit = game.lookup[json.unit.id] as Citizen;
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : undefined;
    const args: DropOffFoodActionArgs = { ...json.args, position };
    return new DropOffFoodAction({ ...json, command, unit, args });
  }
}
