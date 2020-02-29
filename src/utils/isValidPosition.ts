import Game from "../Game";
import { Position } from "../ObjectWithPosition";
import isInBounds from "./isInBounds";

export default (game: Game, position: Position, teamId: string = null) => {
  if (!isInBounds(game, position)) {
    return false;
  }
  if (game.walls[position.key]) {
    return false;
  }
  if (game.citizens[position.key]) {
    return false;
  }
  if (game.fighters[position.key]) {
    return false;
  }
  const hq = game.hqs[position.key];
  if (hq && hq.team.id !== teamId) {
    return false;
  }
  return true;
};
