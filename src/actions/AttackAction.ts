import Game, { Unit } from "../Game";
import HQ from "../HQ";
import { Fighter } from "../fighters";
import {
  MoveCommand,
  AttackCommand,
  SpawnCommand,
  DropOffFoodCommand,
  PickUpFoodCommand
} from "../commands";
import BaseAction, { BaseActionProps, BaseActionJSON } from "./BaseAction";

export type AttackActionArgs = {
  targetId: string;
};

export type AttackActionArgsJSON = {
  targetId: string;
};

export type AttackActionJSON = BaseActionJSON & {
  args: AttackActionArgsJSON;
  className: "AttackAction";
};

export type AttackActionProps = BaseActionProps & {
  unit: Unit;
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
      return this;
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

  static fromJSON(game: Game, json: AttackActionJSON) {
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
    return new AttackAction({ ...json, command, unit, args: json.args });
  }
}
