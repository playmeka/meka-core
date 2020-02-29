import Game from "../Game";
import { Fighter, FighterJSON } from "../fighters";
import { Position, PositionJSON } from "../ObjectWithPosition";
import { commandFromJSON, CommandJSON } from "../commands";
import AbstractAction, { AbstractActionProps } from "./AbstractAction";

export type MoveFighterActionArgs = {
  position: Position;
};

export type MoveFighterActionArgsJSON = {
  position: PositionJSON;
};

export type MoveFighterActionJSON = {
  args: MoveFighterActionArgsJSON;
  className: "MoveFighterAction";
  command: CommandJSON;
  response?: FighterJSON;
  unit: FighterJSON;
};

export type MoveFighterActionProps = AbstractActionProps & {
  unit: Fighter;
  args: MoveFighterActionArgs;
};

export default class MoveFighterAction extends AbstractAction {
  className: string = "MoveFighterAction";

  constructor(props: MoveFighterActionProps) {
    super(props);
    this.unit = props.unit;
  }

  async execute(game: Game) {
    const unit = this.unit as Fighter;
    if (!unit) throw new Error("Unable to find unit with ID: " + this.unit.id);
    if (unit.hp <= 0) throw new Error("Unit is dead (HP is at or below 0)");
    const { position } = this.args;
    if (!position)
      throw new Error("No target or position passed to move towards");

    if (!unit.isValidMove(position))
      throw new Error("Invalid position: " + JSON.stringify(position.toJSON()));

    this.mutateGame(game, unit as Fighter, position);
    this.response = unit.toJSON();
    game.history.pushActions(game.turn, this);
  }

  import(game: Game) {
    const fighter = game.lookup[this.unit.id] as Fighter;
    const position = Position.fromJSON(this.response.position);
    this.mutateGame(game, fighter, position);
  }

  mutateGame(game: Game, fighter: Fighter, position: Position) {
    game.clearUnitPosition(fighter, game.fighters);
    fighter.move(position);
    game.registerUnitPosition(fighter, game.fighters);
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
    } as MoveFighterActionJSON;
  }

  static fromJSON(game: Game, json: MoveFighterActionJSON) {
    const command = commandFromJSON(game, json.command);
    const unit = game.lookup[json.unit.id] as Fighter;
    const position = json.args.position
      ? Position.fromJSON(json.args.position)
      : undefined;
    const args: MoveFighterActionArgs = { ...json.args, position };
    return new MoveFighterAction({ ...json, command, unit, args });
  }
}
