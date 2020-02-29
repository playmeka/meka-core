import Game from "../Game";
import Citizen, { CitizenJSON } from "../Citizen";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { commandFromJSON, CommandJSON } from "../commands";
import AbstractAction, { AbstractActionProps } from "./AbstractAction";

export type MoveCitizenActionArgs = {
  position: Position;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
};

export type MoveCitizenActionArgsJSON = {
  position: PositionJSON;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
};

export type MoveCitizenActionJSON = {
  args: MoveCitizenActionArgsJSON;
  className: "MoveCitizenAction";
  command: CommandJSON;
  response?: CitizenJSON;
  unit: CitizenJSON;
};

export type MoveCitizenActionProps = AbstractActionProps & {
  unit: Citizen;
  args: MoveCitizenActionArgs;
};

export default class MoveCitizenAction extends AbstractAction {
  className: string = "MoveCitizenAction";

  constructor(props: MoveCitizenActionProps) {
    super(props);
    this.unit = props.unit;
  }

  async execute(game: Game) {
    const unit = this.unit as Citizen;
    if (!unit) throw new Error("Unable to find unit with ID: " + this.unit.id);
    if (unit.hp <= 0) throw new Error("Unit is dead (HP is at or below 0)");
    const { position } = this.args;
    if (!position)
      throw new Error("No target or position passed to move towards");

    if (!unit.isValidMove(position))
      throw new Error("Invalid position: " + JSON.stringify(position.toJSON()));
    this.mutateGame(game, unit, position, {
      autoPickUpFood: this.args.autoPickUpFood,
      autoDropOffFood: this.args.autoDropOffFood
    });
    this.response = unit.toJSON();
    game.history.pushActions(game.turn, this);
  }

  import(game: Game) {
    const citizen = game.lookup[this.unit.id] as Citizen;
    const position = Position.fromJSON(this.response.position);
    this.mutateGame(game, citizen as Citizen, position, {
      autoPickUpFood: this.args.autoPickUpFood,
      autoDropOffFood: this.args.autoDropOffFood
    });
  }

  mutateGame(
    game: Game,
    citizen: Citizen,
    position: Position,
    options: { autoPickUpFood?: boolean; autoDropOffFood?: boolean }
  ) {
    // Move citizen
    game.clearUnitPosition(citizen, game.citizens);
    citizen.move(position);
    game.registerUnitPosition(citizen, game.citizens);
    // Move citizen's food (if applicable)
    const citizenFood = citizen.food;
    if (citizenFood) {
      citizenFood.move(position);
    }
    // Pick up food
    const food = game.foods[citizen.key];
    if (food && !citizen.food && options.autoPickUpFood === true) {
      citizen.eatFood(food);
      food.getEatenBy(citizen);
      delete game.foods[food.key]; // Un-register food
    }
    // Drop off food
    const hq = game.hqs[citizen.key];
    if (hq && citizen.food && options.autoDropOffFood === true) {
      const food = citizen.food;
      citizen.dropOffFood();
      hq.eatFood();
      food.getEatenBy(hq);
    }
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
    } as MoveCitizenActionJSON;
  }

  static fromJSON(game: Game, json: MoveCitizenActionJSON) {
    const command = commandFromJSON(game, json.command);
    const unit = game.lookup[json.unit.id] as Citizen;
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : undefined;
    const args: MoveCitizenActionArgs = { ...json.args, position };
    return new MoveCitizenAction({ ...json, command, unit, args });
  }
}
