import Game from "../Game";
import {
  ActionJSON,
  MoveCitizenAction,
  MoveFighterAction,
  AttackAction,
  SpawnCitizenAction,
  SpawnFighterAction,
  DropOffFoodAction,
  PickUpFoodAction,
  Action
} from ".";

export default (game: Game, actionJson: ActionJSON): Action => {
  if (!actionJson) return undefined;
  if (actionJson) {
    const actionClass = {
      MoveCitizenAction,
      MoveFighterAction,
      AttackAction,
      SpawnCitizenAction,
      SpawnFighterAction,
      DropOffFoodAction,
      PickUpFoodAction
    }[actionJson.className];
    // TODO: Handle actionJson type
    return actionClass.fromJSON(game, actionJson as any);
  }
};
