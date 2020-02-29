import Game from "../Game";
import { Position } from "../ObjectWithPosition";
import isInBounds from "./isInBounds";

export default (game: Game, position: Position) => {
  if (!isInBounds(game, position)) {
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
