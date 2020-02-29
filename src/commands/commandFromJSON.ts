import Game from "../Game";
import {
  CommandJSON,
  MoveCommand,
  AttackCommand,
  SpawnCommand,
  DropOffFoodCommand,
  PickUpFoodCommand,
  Command
} from ".";

export default (game: Game, commandJson: CommandJSON): Command => {
  if (!commandJson) return undefined;
  if (commandJson) {
    const commandClass = {
      MoveCommand,
      AttackCommand,
      SpawnCommand,
      DropOffFoodCommand,
      PickUpFoodCommand
    }[commandJson.className];
    // TODO: Handle commandJson type
    return commandClass.fromJSON(game, commandJson as any);
  }
};
