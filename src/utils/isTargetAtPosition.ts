import Game, { Unit } from "../Game";
import { Position } from "../ObjectWithPosition";

export default (
  game: Game,
  position: Position,
  target: Unit,
  teamId: string
) => {
  if (
    position.x >= game.width ||
    position.x < 0 ||
    position.y >= game.height ||
    position.y < 0
  ) {
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
