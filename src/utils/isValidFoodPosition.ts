import Game from "../Game";
import { Position } from "../ObjectWithPosition";

export default (game: Game, position: Position) => {
  if (
    position.x >= game.width ||
    position.x < 0 ||
    position.y >= game.height ||
    position.y < 0
  ) {
    return false;
  }
  if (game.walls[position.key]) {
    return false;
  }
  if (game.foods[position.key]) {
    return false;
  }
  return true;
};
