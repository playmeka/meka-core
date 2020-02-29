import { v4 as uuidv4 } from "uuid";
import { Position } from "./ObjectWithPosition";
import shuffle from "./utils/shuffle";
import Team, { TeamJSON } from "./Team";
import Citizen, { CitizenJSON } from "./Citizen";
import Wall, { WallJSON } from "./Wall";
import Food, { FoodJSON } from "./Food";
import { Action, BaseAction } from "./actions";
import HQ, { HQJSON } from "./HQ";
import CommandResponse from "./CommandResponse";
import History, { HistoryJSON } from "./History";
import PathFinder from "./PathFinder";
import isValidPosition from "./utils/isValidPosition";
import { fighterFromJSON, Fighter, FighterJSON, BaseFighter } from "./fighters";
import { Command } from "./commands";

export type Unit = Citizen | Fighter | HQ;
export type UnitJSON = CitizenJSON | FighterJSON | HQJSON;

export type GameJSON = {
  width: number;
  height: number;
  maxTurns: number;
  maxPop: number;
  turn: number;
  wallCount: number;
  foodCount: number;
  walls: WallJSON[];
  foods: FoodJSON[];
  teams: TeamJSON[];
  citizens: CitizenJSON[];
  fighters: FighterJSON[];
  history: HistoryJSON;
  hqs: HQJSON[];
};

export type GameProps = {
  width: number;
  height: number;
  id?: string;
  turn?: number;
  maxTurns?: number;
  maxPop?: number;
};

export type GameGenerateProps = GameProps & {
  wallCount?: number;
  foodCount?: number;
  homeId?: string;
  awayId?: string;
};

const generateCitizen = (game: Game, team: Team) => {
  const spawnLocation = team.hq.nextSpawnPosition;
  if (!spawnLocation) return;
  const newCitizen = new Citizen(game, {
    teamId: team.id,
    position: spawnLocation
  });
  game.addCitizen(newCitizen);
};

const generateHQ = (game: Game, team: Team, position: Position) => {
  const newHQ = new HQ(game, { teamId: team.id, position });
  game.addHQ(newHQ);
};

const generateTeams = (
  game: Game,
  props: { homeId?: string; awayId?: string } = {}
) => {
  const homeTeam = new Team(game, {
    id: props.homeId || "home",
    color: "blue"
  });

  game.addTeam(homeTeam);
  generateHQ(game, homeTeam, new Position(game.width - 4, 2)); // Top right
  generateCitizen(game, homeTeam);
  const awayTeam = new Team(game, {
    id: props.awayId || "away",
    color: "red"
  });
  game.addTeam(awayTeam);
  generateHQ(game, awayTeam, new Position(2, game.height - 4)); // Bottom left
  generateCitizen(game, awayTeam);
};

const generateWalls = (game: Game, wallCount: number) => {
  const wallPositions = game.positions.filter(position => {
    return (
      !game.walls[position.key] &&
      !game.hqs[position.key] &&
      !position.adjacents.some(adjacent => game.hqs[adjacent.key])
    );
  });
  if (wallCount > wallPositions.length)
    throw new Error(
      `Given wallCount (${wallCount}) exceeds number of available positions (${wallPositions.length}).`
    );
  shuffle(wallPositions)
    .slice(0, wallCount)
    .forEach(wallPosition => {
      const newWall = new Wall({ position: wallPosition });
      game.addWall(newWall);
    });
};

const generateFoods = (game: Game, foodCount: number) => {
  const foodPositions = game.positions.filter(position =>
    isValidPosition(game, position)
  );
  if (foodCount > foodPositions.length)
    throw new Error(
      `Given foodCount (${foodCount}) exceeds number of available positions (${foodPositions.length}).`
    );
  shuffle(foodPositions)
    .slice(0, foodCount)
    .forEach(foodPosition => {
      const newFood = new Food(game, { position: foodPosition });
      game.addFood(newFood);
    });
};

export default class Game {
  teams: Team[] = [];
  hqs: { [key: string]: HQ } = {};
  citizens: { [key: string]: Citizen } = {};
  fighters: { [key: string]: Fighter } = {};
  foods: { [key: string]: Food } = {};
  walls: { [key: string]: Wall } = {};
  history: History;
  lookup: { [id: string]: Unit | Food } = {};
  pathFinder: PathFinder;
  id: string;
  width: number;
  height: number;
  turn: number;
  maxTurns: number;
  maxPop: number;

  constructor(props: GameProps) {
    this.width = props.width;
    this.height = props.height;
    this.id = props.id || uuidv4();
    this.turn = props.turn || 0;
    this.maxTurns = props.maxTurns;
    this.maxPop = props.maxPop;
    this.pathFinder = new PathFinder(this);
    this.history = new History(this);
  }

  get wallsList() {
    return Object.values(this.walls);
  }

  get foodsList() {
    return Object.values(this.lookup).filter(
      value => !!value && value.className === "Food"
    ) as Food[];
  }

  get citizensList() {
    return Object.values(this.lookup).filter(
      object => object.className === "Citizen"
    ) as Citizen[];
  }

  get fightersList() {
    return Object.values(this.lookup).filter(
      object => object instanceof BaseFighter
    ) as Fighter[];
  }

  get hqsList() {
    return Object.values(this.lookup).filter(
      object => object.className === "HQ"
    ) as HQ[];
  }

  get foodLeft() {
    return this.foodsList.filter(food => !food.eatenBy).length;
  }

  get isOver() {
    if (this.maxTurns && this.turn > this.maxTurns) return true;
    return this.teams.some(team => team.hq.hp <= 0);
  }

  get winnerId() {
    if (
      !this.isOver ||
      this.teams.every(team => team.hq.hp <= 0) ||
      this.teams.every(team => team.hq.hp > 0)
    ) {
      return null;
    } else if (this.teams[0].hq.hp <= 0) {
      return this.teams[1].id;
    } else {
      return this.teams[0].id;
    }
  }

  get positions() {
    const positions = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        positions.push(new Position(x, y));
      }
    }
    return positions;
  }

  getTeam(teamId: string) {
    return this.teams.find(team => team.id == teamId);
  }

  toJSON() {
    const { width, height, maxTurns, maxPop, turn } = this;
    return {
      width,
      height,
      maxTurns,
      maxPop,
      turn,
      walls: this.wallsList.map(wall => wall.toJSON()),
      foods: this.foodsList.map(food => food.toJSON()),
      teams: this.teams.map(team => team.toJSON()),
      citizens: this.citizensList.map(citizen => citizen.toJSON()),
      fighters: this.fightersList.map(fighter => fighter.toJSON()),
      history: this.history.toJSON(),
      hqs: this.hqsList.map(hq => hq.toJSON())
    } as GameJSON;
  }

  static generate(props: GameGenerateProps) {
    const game = new Game(props);
    generateTeams(game, { homeId: props.homeId, awayId: props.awayId });
    generateWalls(game, props.wallCount || game.width * game.height * 0.2);
    generateFoods(game, props.foodCount || game.width * game.height * 0.2);
    return game;
  }

  static fromJSON(json: GameJSON) {
    const game = new Game(json);
    game.importTeams(json.teams.map(teamJson => Team.fromJSON(game, teamJson)));
    game.importHQs(json.hqs.map(hqJson => HQ.fromJSON(game, hqJson)));
    game.importWalls(json.walls.map(wallJson => Wall.fromJSON(wallJson)));
    game.importFoods(json.foods.map(foodJson => Food.fromJSON(game, foodJson)));
    game.importCitizens(
      json.citizens.map(citizenJson => Citizen.fromJSON(game, citizenJson))
    );
    game.importFighters(
      json.fighters.map(fighterJson => fighterFromJSON(game, fighterJson))
    );
    game.importHistory(History.fromJSON(game, json.history));
    return game;
  }

  importHistory(history: History) {
    this.history = history;
  }

  importTeams(teams: Team[]) {
    teams.forEach(team => this.addTeam(team));
  }

  importHQs(hqs: HQ[]) {
    hqs.forEach(hq => this.addHQ(hq));
  }

  importCitizens(citizens: Citizen[]) {
    citizens.forEach(citizen => this.addCitizen(citizen));
  }

  importFighters(fighters: Fighter[]) {
    fighters.forEach(fighter => this.addFighter(fighter));
  }

  addTeam(team: Team) {
    this.teams.push(team);
  }

  addHQ(newHQ: HQ) {
    this.registerUnit(newHQ, this.hqs);
  }

  addCitizen(newCitizen: Citizen) {
    this.registerUnit(newCitizen, this.citizens);
  }

  addFighter(newFighter: Fighter) {
    this.registerUnit(newFighter, this.fighters);
  }

  registerUnit(unit: Unit, mapping: { [key: string]: Unit }) {
    this.lookup[unit.id] = unit;
    this.registerUnitPosition(unit, mapping);
  }

  registerUnitPosition(unit: Unit, mapping: { [key: string]: Unit }) {
    unit.covering.forEach(position => {
      mapping[position.key] = unit;
      this.pathFinder.blockPosition(position);
    });
  }

  clearUnitPosition(
    unit: Unit | BaseFighter,
    mapping: { [key: string]: Unit }
  ) {
    unit.covering.forEach(position => {
      delete mapping[position.key];
      this.pathFinder.clearPosition(position);
    });
  }

  importWalls(walls: Wall[]) {
    walls.forEach(wall => {
      this.addWall(wall);
    });
  }

  addWall(newWall: Wall) {
    this.walls[newWall.key] = newWall;
    this.pathFinder.blockPosition(newWall.position);
  }

  importFoods(foods: Food[]) {
    foods.forEach(food => {
      this.addFood(food);
    });
  }

  addFood(newFood: Food) {
    this.lookup[newFood.id] = newFood;
    this.foods[newFood.key] = newFood;
  }

  // Command execution
  async executeTurn(commands: Command[] = []) {
    if (this.isOver) return null;
    // Start new turn and history
    this.turn += 1;
    // Create action queues
    const attacks: Action[] = [];
    const moves: Action[] = [];
    const spawns: Action[] = [];
    const foodPickUps: Action[] = [];
    const foodDropOffs: Action[] = [];

    // Create map for ensuring one action per unit
    const unitToActionMap: { [id: string]: Action } = {};
    const commandToResponseMap: { [id: string]: CommandResponse } = {};

    // Assign commands to Action queues
    commands.forEach(command => {
      let action;
      try {
        action = command.getNextAction(this);
        if (!action) {
          throw new Error("No action available for command: " + command.id);
        } else if (unitToActionMap[action.unit.id]) {
          throw new Error("Duplicate command for unit: " + command.unit.id);
        }

        if (action.className == "AttackAction") {
          unitToActionMap[action.unit.id] = action;
          attacks.push(action);
        } else if (action.className == "MoveAction") {
          unitToActionMap[action.unit.id] = action;
          moves.push(action);
        } else if (action.className === "PickUpFoodAction") {
          unitToActionMap[action.unit.id] = action;
          foodPickUps.push(action);
        } else if (action.className === "DropOffFoodAction") {
          unitToActionMap[action.unit.id] = action;
          foodDropOffs.push(action);
        } else if (action.className == "SpawnAction") {
          unitToActionMap[action.unit.id] = action;
          spawns.push(action);
        }
      } catch (err) {
        commandToResponseMap[command.id] = new CommandResponse({
          command,
          action,
          error: err.message,
          status: "failure"
        });
      }
    });

    // Action execution order
    const allActions = [
      ...attacks,
      ...foodPickUps,
      ...foodDropOffs,
      ...moves,
      ...spawns
    ];

    await allActions.reduce(
      (promise, action) =>
        promise.then(async () => {
          try {
            await action.execute(this);
            commandToResponseMap[action.command.id] = new CommandResponse({
              command: action.command,
              action: action,
              status: "success"
            });
          } catch (err) {
            commandToResponseMap[action.command.id] = new CommandResponse({
              command: action.command,
              action: action,
              error: err.message,
              status: "failure"
            });
          }
        }),
      Promise.resolve()
    );

    return commands.map(command => commandToResponseMap[command.id]);
  }

  // Turn import used to catch instance up to speed and skips validation
  importTurn(turn: number, actions: Action[] = []) {
    if (turn !== this.turn + 1)
      throw new Error(
        `Cannot import turn ${turn} when current turn is ${this.turn}`
      );
    if (this.history.getActions(turn).length)
      throw new Error(`History already contains actions for turn ${turn}`);
    // Start new turn
    this.turn = turn;
    // Iterate through actions
    actions.forEach(action => {
      if (action instanceof BaseAction) action.import(this);
    });
    // Add turn to history
    this.history.pushActions(turn, ...actions);
  }

  killFighter(fighter: BaseFighter) {
    this.clearUnitPosition(fighter, this.fighters);
  }

  killCitizen(citizen: Citizen) {
    const food = citizen.food;
    this.clearUnitPosition(citizen, this.citizens);
    if (food) {
      citizen.dropOffFood();
      food.eatenById = null;
      this.foods[food.key] = food;
    }
  }
}
