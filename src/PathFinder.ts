import * as PathFinding from "pathfinding";
import Game, { Agent } from "./Game";
import Team from "./Team";
import { Position } from "./ObjectWithPosition";

const createGrid = (game: Game) => {
  const grid = new PathFinding.Grid(game.width, game.height);
  game.wallsList.forEach(wall => {
    grid.setWalkableAt(wall.x, wall.y, false);
  });
  return grid;
};

export default class PathFinder {
  grid: PathFinding.Grid;

  constructor(game: Game) {
    this.grid = createGrid(game);
  }

  blockPosition(position: Position) {
    this.grid.setWalkableAt(position.x, position.y, false);
  }

  clearPosition(position: Position) {
    this.grid.setWalkableAt(position.y, position.y, true);
  }

  gridForTeam(team: Team) {
    const grid = this.grid.clone();
    team.hq.covering.forEach(position => {
      grid.setWalkableAt(position.x, position.y, true);
    });
    return grid;
  }

  getPath(agent: Agent, to: Position) {
    const finder = new PathFinding.AStarFinder();
    const path = finder
      .findPath(
        agent.position.x,
        agent.position.y,
        to.x,
        to.y,
        this.gridForTeam(agent.team)
      )
      .map(array => new Position(array[0], array[1]));
    return path.length ? path : null;
  }
}
