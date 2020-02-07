import Game, { Agent } from "../Game";
import { Position } from "../ObjectWithPosition";

export default (
  game: Game,
  position: Position,
  target: Agent,
  teamId: string = null
) => {
  if (!teamId) return false;
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

  if (target.class === "Citizen" && game.citizens[position.key]) {
    return true;
  } else if (target.class === "HQ" && game.hqs[position.key]) {
    return true;
  } else if (target.class.includes("Fighter") && game.fighters[position.key]) {
    // TODO: Less jank
    return true;
  }

  return false;
};
