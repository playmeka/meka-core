import Game from "../Game";
import { Position } from "../ObjectWithPosition";

export default (game: Game, position: Position) => {
  return (
    position.x < game.width &&
    position.x >= 0 &&
    position.y < game.height &&
    position.y >= 0
  );
};
