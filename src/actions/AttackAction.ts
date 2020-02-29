import Game, { Unit, UnitJSON } from "../Game";
import HQ, { HQJSON } from "../HQ";
import { Fighter, FighterJSON } from "../fighters";
import { CommandJSON, commandFromJSON } from "../commands";
import BaseAction, { BaseActionProps } from "./BaseAction";

export type AttackActionArgs = {
  targetId: string;
};

export type AttackActionArgsJSON = {
  targetId: string;
};

export type AttackActionJSON = {
  args: AttackActionArgsJSON;
  className: "AttackAction";
  command: CommandJSON;
  response?: UnitJSON;
  unit: FighterJSON | HQJSON;
};

export type AttackActionProps = BaseActionProps & {
  unit: Fighter | HQ;
  args: AttackActionArgs;
};

export default class AttackAction extends BaseAction {
  className: string = "AttackAction";

  constructor(props: AttackActionProps) {
    super(props);
  }

  async execute(game: Game) {
    const { targetId } = this.args;
    const target = game.lookup[targetId] as Unit;
    const unit = this.unit as Fighter | HQ;

    if (!target) throw new Error("No target passed to attack");
    if (target.hp <= 0) throw new Error("Target is dead (HP is at or below 0)");
    if (unit.hp <= 0) throw new Error("Unit is dead (HP is at or below 0)");

    const isTargetInRange = target.covering.some(position =>
      unit.isValidAttack(target, position)
    );

    if (isTargetInRange) {
      this.handleAttack(unit, target);
      this.response = target.toJSON();
      game.history.pushActions(game.turn, this);
    } else {
      throw new Error("Target is not within range: " + target.id); // miss!
    }
  }

  import(game: Game) {
    const fighter = game.lookup[this.unit.id] as Fighter;
    const target = game.lookup[this.response.id] as Unit;
    this.handleAttack(fighter, target);
  }

  // Mutations
  handleAttack(fighter: Fighter | HQ, target: Unit) {
    target.takeDamage(fighter.getAttackDamageFor(target));
  }

  toJSON() {
    const { command, response, unit, args, className, id } = this;
    return {
      id,
      className,
      response,
      command: command.toJSON(),
      unit: unit.toJSON(),
      args
    } as AttackActionJSON;
  }

  static fromJSON(game: Game, json: AttackActionJSON) {
    const command = commandFromJSON(game, json.command);
    const unit = game.lookup[json.unit.id] as Fighter | HQ;
    return new AttackAction({ ...json, command, unit, args: json.args });
  }
}
