const PathFinding = require("pathfinding");
import Game, { Agent } from "./Game";
import Team from "./Team";
import { Position } from "./ObjectWithPosition";

const createGrid = (game: Game) => {
  const matrix = [];
  for (let y = 0; y < game.height; y++) {
    matrix.push([]);
    for (let x = 0; x < game.width; x++) {
      const hasWall = game.walls[`${x},${y}`];
      matrix[y].push(hasWall ? 1 : 0);
    }
  }
  return new PathFinding.Grid(matrix);
};

export default class PathFinder {
  grid: any;
  finder: any;

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
      .map((array: Array<number>) => new Position(array[0], array[1]));
    return path.length ? path : false;
  }
}
