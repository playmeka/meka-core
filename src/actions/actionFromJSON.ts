import Game from "../Game";
import {
  ActionJSON,
  MoveAction,
  AttackAction,
  SpawnAction,
  DropOffFoodAction,
  PickUpFoodAction,
  Action
} from ".";

export default (game: Game, actionJson: ActionJSON): Action => {
  if (!actionJson) return undefined;
  if (actionJson) {
    const actionClass = {
      MoveAction,
      AttackAction,
      SpawnAction,
      DropOffFoodAction,
      PickUpFoodAction
    }[actionJson.className];
    // TODO: Handle actionJson type
    return actionClass.fromJSON(game, actionJson as any);
  }
};
