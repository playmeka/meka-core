import { v4 as uuidv4 } from "uuid";
import { Position } from "./ObjectWithPosition";
import shuffle from "./utils/shuffle";
import Team, { TeamJSON } from "./Team";
import Citizen, { CitizenJSON, CitizenProps } from "./Citizen";
import Wall, { WallJSON } from "./Wall";
import Food, { FoodJSON } from "./Food";
import Action from "./Action";
import HQ, { HQJSON } from "./HQ";
import CommandResponse from "./CommandResponse";
import History, { HistoryJSON } from "./History";
import PathFinder from "./PathFinder";
import isValidPosition from "./utils/isValidPosition";
import CavalryFighter, {
  CavalryFighterJSON,
  CavalryFighterProps
} from "./CavalryFighter";
import InfantryFighter, {
  InfantryFighterJSON,
  InfantryFighterProps
} from "./InfantryFighter";
import RangedFighter, {
  RangedFighterJSON,
  RangedFighterProps
} from "./RangedFighter";
import {
  MoveCommand,
  AttackCommand,
  SpawnCommand,
  DropOffFoodCommand,
  PickUpFoodCommand
} from "./commands";

export type Command =
  | MoveCommand
  | AttackCommand
  | SpawnCommand
  | DropOffFoodCommand
  | PickUpFoodCommand;

export type FighterType =
  | "InfantryFighter"
  | "RangedFighter"
  | "CavalryFighter";
export type Fighter = CavalryFighter | InfantryFighter | RangedFighter;
export type Unit = Citizen | Fighter | HQ;
export type UnitJSON = CitizenJSON | FighterJSON | HQJSON;
export type FighterJSON =
  | CavalryFighterJSON
  | InfantryFighterJSON
  | RangedFighterJSON;
export type FighterProps =
  | CavalryFighterProps
  | InfantryFighterProps
  | RangedFighterProps;

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

const generateTeams = (
  game: Game,
  props: { homeId?: string; awayId?: string } = {}
) => {
  const homeTeam = new Team(game, {
    id: props.homeId || "home",
    color: "blue",
    hq: { position: new Position(game.width - 4, 2) } // Top right
  });
  game.addTeam(homeTeam);
  generateCitizen(game, homeTeam);
  const awayTeam = new Team(game, {
    id: props.awayId || "away",
    color: "red",
    hq: { position: new Position(2, game.height - 4) } // Bottom left
  });
  game.addTeam(awayTeam);
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
      value => !!value && value.class === "Food"
    ) as Food[];
  }

  get citizensList() {
    return Object.values(this.lookup).filter(
      object => object.class === "Citizen"
    ) as Citizen[];
  }

  get fightersList() {
    const fighterTypes = ["InfantryFighter", "CavalryFighter", "RangedFighter"];
    return Object.values(this.lookup).filter(object =>
      fighterTypes.includes(object.class)
    ) as Fighter[];
  }

  get hqsList() {
    return this.teams.map(team => team.hq);
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
    return this.teams.filter(team => team.id == teamId)[0];
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
      history: this.history.toJSON()
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
    game.importWalls(json.walls.map(wallJson => Wall.fromJSON(wallJson)));
    game.importFoods(json.foods.map(foodJson => Food.fromJSON(game, foodJson)));
    game.importCitizens(
      json.citizens.map(citizenJson => Citizen.fromJSON(game, citizenJson))
    );
    game.importFighters(
      json.fighters.map(fighterJson => {
        if (fighterJson.class === "CavalryFighter")
          return CavalryFighter.fromJSON(game, fighterJson);
        else if (fighterJson.class === "RangedFighter")
          return RangedFighter.fromJSON(game, fighterJson);
        else if (fighterJson.class === "InfantryFighter")
          return InfantryFighter.fromJSON(game, fighterJson);
      })
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

  importCitizens(citizens: Citizen[]) {
    citizens.forEach(citizen => this.addCitizen(citizen));
  }

  importFighters(fighters: Fighter[]) {
    fighters.forEach(fighter => this.addFighter(fighter));
  }

  addTeam(team: Team) {
    this.teams.push(team);
    this.registerUnit(team.hq, this.hqs);
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

  clearUnitPosition(unit: Unit, mapping: { [key: string]: Unit }) {
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
  // executeAttack, executeMove, executeSpawn, executeFoodPickUp, executeFoodDropOff all return actions
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
    const commandIdToResponses: { [id: string]: CommandResponse } = {};

    // Assign commands to Action queues
    commands.forEach(command => {
      const action = command.getNextAction(this);
      if (!action || unitToActionMap[action.unit.id]) {
        commandIdToResponses[command.id] = new CommandResponse({
          command,
          action,
          status: "failure"
        });
        return null;
      }
      if (action.type == "attack") {
        unitToActionMap[action.unit.id] = action;
        attacks.push(action);
      } else if (action.type == "move") {
        unitToActionMap[action.unit.id] = action;
        moves.push(action);
      } else if (action.type === "pickUpFood") {
        unitToActionMap[action.unit.id] = action;
        foodPickUps.push(action);
      } else if (action.type === "dropOffFood") {
        unitToActionMap[action.unit.id] = action;
        foodDropOffs.push(action);
      } else if (action.type == "spawn") {
        unitToActionMap[action.unit.id] = action;
        spawns.push(action);
      }
    });
    // Execute attacks in order
    await attacks.reduce(
      (promise, action) =>
        promise.then(async () => {
          const response = await this.executeAttack(action);
          commandIdToResponses[response.command.id] = new CommandResponse({
            command: response.command,
            action: response,
            status: response.status === "success" ? "success" : "failure"
          });
        }),
      Promise.resolve()
    );
    // Execute food pick ups in order
    await foodPickUps.reduce(
      (promise, action) =>
        promise.then(async () => {
          const response = await this.executeFoodPickUp(action);
          commandIdToResponses[response.command.id] = new CommandResponse({
            command: response.command,
            action: response,
            status: response.status === "success" ? "success" : "failure"
          });
        }),
      Promise.resolve()
    );
    // Execute food drop offs in order
    await foodDropOffs.reduce(
      (promise, action) =>
        promise.then(async () => {
          const response = await this.executeFoodDropOff(action);
          commandIdToResponses[response.command.id] = new CommandResponse({
            command: response.command,
            action: response,
            status: response.status === "success" ? "success" : "failure"
          });
        }),
      Promise.resolve()
    );
    // Execute moves in order
    await moves.reduce(
      (promise, action) =>
        promise.then(async () => {
          const response = await this.executeMove(action);
          commandIdToResponses[response.command.id] = new CommandResponse({
            command: response.command,
            action: response,
            status: response.status === "success" ? "success" : "failure"
          });
        }),
      Promise.resolve()
    );
    // Execute spawns in order
    await spawns.reduce(
      (promise, action) =>
        promise.then(async () => {
          const response = await this.executeSpawn(action);
          commandIdToResponses[response.command.id] = new CommandResponse({
            command: response.command,
            action: response,
            status: response.status === "success" ? "success" : "failure"
          });
        }),
      Promise.resolve()
    );

    return commands.map(command => commandIdToResponses[command.id]);
  }

  async executeFoodDropOff(action: Action) {
    if (action.type !== "dropOffFood") return;
    try {
      const unit = action.unit as Citizen;
      if (!unit)
        throw new Error("Unable to find unit with ID: " + action.unit.id);
      if (unit.hp <= 0) throw new Error("Unit is dead (HP is at or below 0)");
      if (unit.class !== "Citizen") throw new Error("Unit is not a citizen");
      if (!unit.food) throw new Error("Unit does not have food to drop off");
      const { position } = action.args;
      const food = unit.food;

      if (unit.position.isAdjacentTo(position)) {
        if (!food.isValidDropOff(position))
          throw new Error(
            "Invalid drop-off position: " + JSON.stringify(position.toJSON())
          );

        const hq = this.hqs[position.key];
        unit.dropOffFood();
        if (hq) {
          hq.eatFood();
          food.getEatenBy(hq);
        } else {
          food.eatenById = null;
          food.move(position);
          this.foods[position.key] = food;
        }
        action.status = "success";
        action.response = unit.toJSON();
        this.history.pushActions(this.turn, action);
        return action;
      } else {
        throw new Error("Unit is not adjacent to the food");
      }
    } catch (err) {
      action.status = "failure";
      action.error = err.message;
      return action;
    }
  }

  async executeFoodPickUp(action: Action) {
    if (action.type !== "pickUpFood") return;
    try {
      const unit = action.unit as Citizen;
      if (!unit)
        throw new Error("Unable to find unit with ID: " + action.unit.id);
      if (unit.hp <= 0) throw new Error("Unit is dead (HP is at or below 0)");
      if (unit.class !== "Citizen") throw new Error("Unit is not a citizen");
      if (unit.food) throw new Error("Unit already has food");

      const { position } = action.args;
      const food = this.foods[position.key];

      if (!food || food.eatenBy)
        throw new Error(
          "Unable to find food: " + JSON.stringify(position.toJSON())
        );

      if (food.eatenBy)
        throw new Error(
          "Food is already eaten by unit with ID: " + food.eatenById
        );

      if (unit.position.isAdjacentTo(food.position)) {
        unit.eatFood(food);
        food.getEatenBy(unit);
        delete this.foods[food.key]; // Un-register food
        action.status = "success";
        action.response = unit.toJSON();
        this.history.pushActions(this.turn, action);
        return action;
      } else {
        throw new Error("Unit is not adjacent to the food");
      }
    } catch (err) {
      action.status = "failure";
      action.error = err.message;
      return action;
    }
  }

  async executeAttack(action: Action) {
    if (action.type !== "attack") return;
    try {
      const { targetId } = action.args;
      const target = this.lookup[targetId] as Unit;
      const unit = action.unit as Fighter | HQ;

      if (!target) throw new Error("No target passed to attack");
      if (target.hp <= 0)
        throw new Error("Target is dead (HP is at or below 0)");
      if (unit.hp <= 0) throw new Error("Unit is dead (HP is at or below 0)");

      const isTargetInRange = target.covering.some(position =>
        unit.isValidAttack(target, position)
      );

      if (isTargetInRange) {
        this.handleAttack(unit, target);
        action.status = "success";
        action.response = target.toJSON();
        this.history.pushActions(this.turn, action);
        return action;
      } else {
        throw new Error("Target is not within range: " + target.id); // miss!
      }
    } catch (err) {
      action.status = "failure";
      action.error = err.message;
      return action;
    }
  }

  async executeMove(action: Action) {
    if (action.type !== "move") return;
    try {
      const unit = action.unit as Citizen | Fighter;
      if (!unit)
        throw new Error("Unable to find unit with ID: " + action.unit.id);
      if (unit.hp <= 0) throw new Error("Unit is dead (HP is at or below 0)");
      const { position } = action.args;
      if (!position)
        throw new Error("No target or position passed to move towards");

      if (!unit.isValidMove(position))
        throw new Error(
          "Invalid position: " + JSON.stringify(position.toJSON())
        );
      if (unit.class == "Citizen") {
        this.handleCitizenMove(unit as Citizen, position, {
          autoPickUpFood: action.args.autoPickUpFood,
          autoDropOffFood: action.args.autoDropOffFood
        });
      } else {
        this.handleFighterMove(unit as Fighter, position);
      }
      action.status = "success";
      action.response = unit.toJSON();
      this.history.pushActions(this.turn, action);
      return action;
    } catch (err) {
      action.status = "failure";
      action.error = err.message;
      return action;
    }
  }

  async executeSpawn(action: Action) {
    if (action.type !== "spawn") return;
    try {
      const { unit } = action;
      if (unit.hp <= 0) throw new Error("HQ is dead (HP is at or below 0)");
      const position = action.args.position || (unit as HQ).nextSpawnPosition;
      if (!position) throw new Error("No position available for spawn");
      if (!unit.covering.find(hqPosition => hqPosition.isEqualTo(position)))
        throw new Error(
          "Invalid position: " + JSON.stringify(position.toJSON())
        );

      if (action.args.unitType == "Citizen") {
        const newCitizen = this.spawnCitizen(unit as HQ, { position });
        action.status = "success";
        action.response = newCitizen.toJSON();
        this.history.pushActions(this.turn, action);
        return action;
      } else {
        const newFighter = this.spawnFighter(unit as HQ, action.args.unitType, {
          position
        });
        action.status = "success";
        action.response = newFighter.toJSON();
        this.history.pushActions(this.turn, action);
        return action;
      }
    } catch (err) {
      action.status = "failure";
      action.error = err.message;
      return action;
    }
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
      const { type, unit, status, response, args } = action;
      if (status !== "success") return;
      if (type === "attack") {
        const fighter = this.lookup[unit.id] as Fighter;
        const target = this.lookup[response.id] as Unit;
        this.handleAttack(fighter, target);
      } else if (type === "move") {
        const citizenOrFighter = this.lookup[unit.id] as Citizen | Fighter;
        const position = Position.fromJSON(response.position);
        if (citizenOrFighter.class === "Citizen") {
          this.handleCitizenMove(citizenOrFighter as Citizen, position, {
            autoPickUpFood: args.autoPickUpFood,
            autoDropOffFood: args.autoDropOffFood
          });
        } else {
          this.handleFighterMove(unit as Fighter, position);
        }
      } else if (type === "spawn") {
        const hq = unit as HQ;
        const position = Position.fromJSON(response.position);
        if (args.unitType === "Citizen") {
          this.spawnCitizen(hq, { ...response, position });
        } else {
          this.spawnFighter(hq, args.unitType, {
            ...response,
            position
          });
        }
      }
    });
    // Add turn to history
    this.history.pushActions(turn, ...actions);
  }

  // Mutations
  handleAttack(fighter: Fighter | HQ, target: Unit) {
    target.takeDamage(fighter.getAttackDamageFor(target));
  }

  handleCitizenMove(
    citizen: Citizen,
    position: Position,
    options: { autoPickUpFood?: boolean; autoDropOffFood?: boolean }
  ) {
    // Move citizen
    this.clearUnitPosition(citizen, this.citizens);
    citizen.move(position);
    this.registerUnitPosition(citizen, this.citizens);
    // Move citizen's food (if applicable)
    const citizenFood = citizen.food;
    if (citizenFood) {
      citizenFood.move(position);
    }
    // Pick up food
    const food = this.foods[citizen.key];
    if (food && !citizen.food && options.autoPickUpFood === true) {
      citizen.eatFood(food);
      food.getEatenBy(citizen);
      delete this.foods[food.key]; // Un-register food
    }
    // Drop off food
    const hq = this.hqs[citizen.key];
    if (hq && citizen.food && options.autoDropOffFood === true) {
      const food = citizen.food;
      citizen.dropOffFood();
      hq.eatFood();
      food.getEatenBy(hq);
    }
  }

  handleFighterMove(fighter: Fighter, position: Position) {
    this.clearUnitPosition(fighter, this.fighters);
    fighter.move(position);
    this.registerUnitPosition(fighter, this.fighters);
  }

  spawnCitizen(hq: HQ, props: Partial<CitizenProps>) {
    const { team } = hq;
    if (team.pop >= this.maxPop) {
      throw new Error("Population cap reached");
    }
    const newCitizen = new Citizen(this, {
      ...props,
      teamId: team.id
    } as CitizenProps);

    if (team.foodCount < newCitizen.cost) {
      throw new Error("Not enough food to pay for spawn");
    }
    team.spendFood(newCitizen.cost);
    this.addCitizen(newCitizen);
    return newCitizen;
  }

  spawnFighter(hq: HQ, fighterType: FighterType, props: Partial<FighterProps>) {
    const { team } = hq;
    if (team.pop >= this.maxPop) {
      throw new Error("Population cap reached");
    }

    const fighterClass = { CavalryFighter, RangedFighter, InfantryFighter }[
      fighterType
    ];
    const newFighter = new fighterClass(this, {
      ...props,
      teamId: team.id
    } as FighterProps);

    if (team.foodCount < newFighter.cost) {
      throw new Error("Not enough food to pay for spawn");
    }
    team.spendFood(newFighter.cost);
    this.addFighter(newFighter);
    return newFighter;
  }

  killFighter(fighter: Fighter) {
    delete this.fighters[fighter.key];
  }

  killCitizen(citizen: Citizen) {
    const food = citizen.food;
    delete this.citizens[citizen.key];
    if (food) {
      citizen.dropOffFood();
      food.eatenById = null;
      this.foods[food.key] = food;
    }
  }

  getOptimalPathToTarget(unit: Citizen | Fighter, target: Unit) {
    let allPaths: Position[][] = [];

    // If the unit is a Citizen, go to the closest position that the target covers
    if (unit.class === "Citizen") {
      allPaths = target.covering
        .map(position => this.pathFinder.getPath(unit, position))
        .filter(Boolean);
    }
    // If the unit is a Fighter, go to the closest position that's adjacent the area that the target covers
    else {
      let allPositions: Position[] = [];
      target.covering.forEach(position =>
        allPositions.push(
          ...position.adjacentsWithinDistance((unit as Fighter).range)
        )
      );

      // TODO: Check if this is stable.
      const uniquePositions = Array.from(
        new Set(allPositions.map(position => position.key))
      ).map(key => {
        return allPositions.find(position => position.key === key);
      });

      allPaths = uniquePositions
        .map(position => this.pathFinder.getPath(unit, position))
        .filter(Boolean);
    }

    if (allPaths.length > 0)
      return allPaths.reduce((a, b) => (a.length < b.length ? a : b));
    else return null;
  }
}
