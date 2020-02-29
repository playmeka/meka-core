import Game, { Unit } from "../Game";
import AbstractCommand from "./AbstractCommand";
import { AttackAction, MoveFighterAction } from "../actions";
import HQ from "../HQ";
import { Fighter, AbstractFighter, FighterJSON } from "../fighters";

export type AttackCommandArgs = {
  targetId: string;
};

export type AttackCommandArgsJSON = {
  targetId: string;
};

export type AttackCommandJSON = {
  id: string;
  className: "AttackCommand";
  unit: FighterJSON;
  args: AttackCommandArgsJSON;
};

export default class AttackCommand extends AbstractCommand {
  className: string = "AttackCommand";

  constructor(props: { unit: Unit; args: AttackCommandArgs; id?: string }) {
    super(props);
  }

  getNextAction(game: Game): AttackAction | MoveFighterAction {
    const { targetId } = this.args;
    const target = game.lookup[targetId] as Unit;
    const unit = this.unit as Fighter | HQ;

    if (!target) return null;
    if (target.hp <= 0) return null;
    if (unit.hp <= 0) return null;

    const isTargetInRange = target.covering.some(position =>
      unit.isValidAttack(target, position)
    );

    if (isTargetInRange) {
      return new AttackAction({
        command: this,
        args: { targetId },
        unit
      });
    } else if (unit.className === "HQ") {
      return null;
    } else if (unit instanceof AbstractFighter) {
      const path = unit.getPathToTarget(target);

      if (!path) return null;
      // Take unit.speed steps at a time
      // Note: it is not unit.speed - 1 because PathFinder returns the unit
      // position as the first step in the path
      const newPosition =
        path[(unit as Fighter).speed] || path[path.length - 1];

      return new MoveFighterAction({
        command: this,
        args: {
          position: newPosition,
          autoDropOffFood: false,
          autoPickUpFood: false
        },
        unit
      });
    }
  }

  toJSON() {
    const { className, id, unit, args } = this;
    return {
      className,
      id,
      unit: unit.toJSON(),
      args
    } as AttackCommandJSON;
  }

  static fromJSON(game: Game, json: AttackCommandJSON) {
    const unit = game.lookup[json.unit.id] as Unit;
    return new AttackCommand({ ...json, unit });
  }
}
