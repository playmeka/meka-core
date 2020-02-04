import Game from "../Game";
import { Position } from "../ObjectWithPosition";

export default (game: Game, position: Position, teamId: string = null) => {
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
  if (game.citizens[position.key]) {
    return false;
  }
  if (game.fighters[position.key]) {
    return false;
  }
  const hq = game.hqs[position.key];
  if (hq && hq.team.id != teamId) {
    return false;
  }
  return true;
};
