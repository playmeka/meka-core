import Game from "../Game";
import { Position } from "../ObjectWithPosition";

export const isInBounds = (game: Game, position: Position) => {
  return (
    position.x < game.width &&
    position.x >= 0 &&
    position.y < game.height &&
    position.y >= 0
  );
};

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
