import Game from "../Game";
import Citizen, { CitizenJSON } from "../Citizen";
import { Fighter, FighterJSON } from "../fighters";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { commandFromJSON, CommandJSON } from "../commands";
import BaseAction, { BaseActionProps } from "./BaseAction";

export type MoveActionArgs = {
  position: Position;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
};

export type MoveActionArgsJSON = {
  position: PositionJSON;
  autoPickUpFood?: boolean;
  autoDropOffFood?: boolean;
};

export type MoveActionJSON = {
  args: MoveActionArgsJSON;
  className: "MoveAction";
  command: CommandJSON;
  response?: CitizenJSON | FighterJSON;
  unit: CitizenJSON | FighterJSON;
};

export type MoveActionProps = BaseActionProps & {
  unit: Citizen | Fighter;
  args: MoveActionArgs;
};

export default class MoveAction extends BaseAction {
  className: string = "MoveAction";

  constructor(props: MoveActionProps) {
    super(props);
    this.unit = props.unit;
  }

  async execute(game: Game) {
    const unit = this.unit as Citizen | Fighter;
    if (!unit) throw new Error("Unable to find unit with ID: " + this.unit.id);
    if (unit.hp <= 0) throw new Error("Unit is dead (HP is at or below 0)");
    const { position } = this.args;
    if (!position)
      throw new Error("No target or position passed to move towards");

    if (!unit.isValidMove(position))
      throw new Error("Invalid position: " + JSON.stringify(position.toJSON()));
    if (unit.className == "Citizen") {
      this.handleCitizenMove(game, unit as Citizen, position, {
        autoPickUpFood: this.args.autoPickUpFood,
        autoDropOffFood: this.args.autoDropOffFood
      });
    } else {
      this.handleFighterMove(game, unit as Fighter, position);
    }
    this.response = unit.toJSON();
    game.history.pushActions(game.turn, this);
  }

  import(game: Game) {
    const citizenOrFighter = game.lookup[this.unit.id] as Citizen | Fighter;
    const position = Position.fromJSON(this.response.position);
    if (citizenOrFighter.className === "Citizen") {
      this.handleCitizenMove(game, citizenOrFighter as Citizen, position, {
        autoPickUpFood: this.args.autoPickUpFood,
        autoDropOffFood: this.args.autoDropOffFood
      });
    } else {
      this.handleFighterMove(game, this.unit as Fighter, position);
    }
  }

  handleFighterMove(game: Game, fighter: Fighter, position: Position) {
    game.clearUnitPosition(fighter, game.fighters);
    fighter.move(position);
    game.registerUnitPosition(fighter, game.fighters);
  }

  handleCitizenMove(
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
    } as MoveActionJSON;
  }

  static fromJSON(game: Game, json: MoveActionJSON) {
    const command = commandFromJSON(game, json.command);
    const unit = game.lookup[json.unit.id] as Citizen | Fighter;
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : undefined;
    const args: MoveActionArgs = { ...json.args, position };
    return new MoveAction({ ...json, command, unit, args });
  }
}
