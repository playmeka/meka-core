import Game, { Fighter, Unit } from "../Game";
import Command, { CommandJSON, CommandArgs } from "../Command";
import { Position } from "../ObjectWithPosition";
import Action from "../Action";
import HQ from "../HQ";

export default class AttackCommand extends Command {
  className: string = "AttackCommand";

  constructor(props: { unit: Unit; args?: CommandArgs; id?: string }) {
    super(props);
  }

  getNextAction(game: Game): Action {
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
      return new Action({
        command: this,
        type: "attack",
        args: { targetId },
        unit
      });
    } else if (unit.className === "HQ") {
      return null;
    } else if (
      ["InfantryFighter", "RangedFighter", "CavalryFighter"].includes(
        unit.className
      )
    ) {
      const path = game.getOptimalPathToTarget(unit as Fighter, target);

      if (!path) return null;
      // Take unit.speed steps at a time
      // Note: it is not unit.speed - 1 because PathFinder returns the unit
      // position as the first step in the path
      const newPosition =
        path[(unit as Fighter).speed] || path[path.length - 1];

      return new Action({
        command: this,
        type: "move",
        args: {
          position: newPosition,
          autoDropOffFood: false,
          autoPickUpFood: false
        },
        unit
      });
    }
  }

  static fromJSON(game: Game, json: CommandJSON) {
    const unit = game.lookup[json.unit.id] as Unit;
    let args = json.args || {};
    if (args.position) {
      args.position = new Position(args.position.x, args.position.y);
    }

    return new AttackCommand({ ...json, unit, args: args as CommandArgs });
  }
}
