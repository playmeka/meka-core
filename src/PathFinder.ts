import * as PathFinding from "pathfinding";
import Game, { Unit } from "./Game";
import Team from "./Team";
import { BaseFighter } from "./fighters";
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
    this.grid.setWalkableAt(position.x, position.y, true);
  }

  gridForTeam(team: Team) {
    const grid = this.grid.clone();
    team.hq.covering.forEach(position => {
      grid.setWalkableAt(position.x, position.y, true);
    });
    return grid;
  }

  getPath(unit: Unit | BaseFighter, to: Position) {
    const finder = new PathFinding.AStarFinder();
    const path = finder
      .findPath(
        unit.position.x,
        unit.position.y,
        to.x,
        to.y,
        this.gridForTeam(unit.team)
      )
      .map(array => new Position(array[0], array[1]));
    return path.length ? path : null;
  }

  getPaths(unit: Unit | BaseFighter, toOptions: Position[]) {
    return toOptions
      .map(position => this.getPath(unit, position))
      .filter(Boolean);
  }
}
