import Game, { Unit } from "../Game";
import { Position } from "../ObjectWithPosition";
import isInBounds from "./isInBounds";

export default (
  game: Game,
  position: Position,
  target: Unit,
  teamId: string
) => {
  if (!isInBounds(game, position)) {
    return false;
  }

  if (target.teamId === teamId) {
    return false;
  }

  if (game.walls[position.key]) {
    return false;
  }

  return target.covering.find(
    pos => pos.x === position.x && pos.y === position.y
  );
};
