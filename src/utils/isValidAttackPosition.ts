import Game from "../Game";
import { Position } from "../ObjectWithPosition";

export default (game: Game, position: Position, teamId: string = null) => {
  if (!teamId) return false;
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
  const citizen = game.citizens[position.key];
  if (citizen && citizen.teamId != teamId) {
    return true;
  }
  const fighter = game.fighters[position.key];
  if (fighter && fighter.teamId != teamId) {
    return true;
  }
  const hq = game.hqs[position.key];
  if (hq && hq.team.id != teamId) {
    return true;
  }
  return false;
};
