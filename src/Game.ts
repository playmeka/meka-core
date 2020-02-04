import { Position, randomPosition } from "./ObjectWithPosition";
import shuffle from "./utils/shuffle";
import Team, { TeamJSON } from "./Team";
import Citizen, { CitizenJSON } from "./Citizen";
import CavalryFighter, { CavalryFighterJSON } from "./CavalryFighter";
import InfantryFighter, { InfantryFighterJSON } from "./InfantryFighter";
import RangedFighter, { RangedFighterJSON } from "./RangedFighter";
import Wall, { WallJSON } from "./Wall";
import Food, { FoodJSON } from "./Food";
import Action from "./Action";
import HQ from "./HQ";
import ActionHistory, { ActionHistoryJSON } from "./ActionHistory";
import PathFinder from "./PathFinder";

export type FighterType = "infantry" | "ranged" | "cavalry";
export type Fighters = CavalryFighter | InfantryFighter | RangedFighter;
export type FighterJSON =
  | CavalryFighterJSON
  | InfantryFighterJSON
  | RangedFighterJSON;

export type Agent = Citizen | Fighters | HQ;

export type GameJSON = {
  width: number;
  height: number;
  maxTurns: number;
  maxPop: number;
  turn: number;
  citizenCost: number;
  wallCount: number;
  foodCount: number;
  walls: WallJSON[];
  foods: FoodJSON[];
  teams: TeamJSON[];
  citizens: CitizenJSON[];
  fighters: FighterJSON[];
  actionHistory: ActionHistoryJSON;
};

type GameProps = {
  width: number;
  height: number;
  turn?: number;
  maxTurns?: number;
  maxPop?: number;
  citizenCost?: number;
};

type GameGenerateProps = GameProps & {
  wallCount?: number;
  foodCount?: number;
  homeId?: string;
  awayId?: string;
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
  game.spawnCitizen(homeTeam.hq, { skipFood: true });
  const awayTeam = new Team(game, {
    id: props.awayId || "away",
    color: "red",
    hq: { position: new Position(2, game.height - 4) } // Bottom left
  });
  game.addTeam(awayTeam);
  game.spawnCitizen(awayTeam.hq, { skipFood: true });
};

const generateWalls = (game: Game, wallCount: number) => {
  let failures = 0;
  const maxFailures = game.width * game.height; // Arbitrary
  while (game.wallsList.length < wallCount) {
    const newWall = new Wall({
      position: randomPosition(game.width, game.height)
    });
    if (!game.walls[newWall.key] && !game.hqs[newWall.key]) {
      game.addWall(newWall);
    } else {
      failures += 1;
      if (failures > maxFailures)
        throw new Error("Too many failed wall generations.");
    }
  }
};

const generateFoods = (game: Game, foodCount: number) => {
  let failures = 0;
  const maxFailures = game.width * game.height; // Arbitrary
  while (game.foodsList.length < foodCount) {
    const newFood = new Food(game, {
      position: randomPosition(game.width, game.height)
    });
    if (
      game.isValidPosition(newFood.position) &&
      !game.foods[newFood.position.key]
    ) {
      game.addFood(newFood);
    } else {
      failures += 1;
      if (failures > maxFailures)
        throw new Error("Too many failed food generations.");
    }
  }
};

export default class Game {
  teams: Team[] = [];
  hqs: { [key: string]: HQ } = {};
  citizens: { [key: string]: Citizen } = {};
  fighters: { [key: string]: Fighters } = {};
  foods: { [key: string]: Food } = {};
  walls: { [key: string]: Wall } = {};
  actionHistory: ActionHistory;
  lookup: { [id: string]: Agent | Food } = {};
  pathFinder: PathFinder;
  width: number;
  height: number;
  turn: number;
  maxTurns: number;
  maxPop: number;
  citizenCost: number;

  constructor(props: GameProps) {
    this.width = props.width;
    this.height = props.height;
    this.turn = props.turn || 0;
    this.citizenCost = props.citizenCost || 2;
    this.maxTurns = props.maxTurns;
    this.maxPop = props.maxPop;
    this.pathFinder = new PathFinder(this);
    this.actionHistory = new ActionHistory(this);
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
    return Object.values(this.citizens).filter(citizen => !!citizen);
  }

  get fightersList() {
    return Object.values(this.fighters).filter(fighter => !!fighter);
  }

  get hqsList() {
    return Object.values(this.hqs).filter(hq => !!hq);
  }

  get foodLeft() {
    return this.foodsList.filter(food => !food.eatenBy).length;
  }

  get isOver() {
    if (this.maxTurns && this.turn > this.maxTurns) {
      return true;
    }
    return this.teams.some(team => team.hq.hp <= 0);
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
    const { width, height, maxTurns, maxPop, citizenCost, turn } = this;
    return {
      width,
      height,
      maxTurns,
      maxPop,
      turn,
      citizenCost,
      walls: this.wallsList.map(wall => wall.toJSON()),
      foods: this.foodsList.map(food => food.toJSON()),
      teams: this.teams.map(team => team.toJSON()),
      citizens: this.citizensList.map(citizen => citizen.toJSON()),
      fighters: this.fightersList.map(fighter => fighter.toJSON()),
      actionHistory: this.actionHistory.toJSON()
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
    game.importActionHistory(ActionHistory.fromJSON(game, json.actionHistory));
    return game;
  }

  importActionHistory(history: ActionHistory) {
    this.actionHistory = history;
  }

  importTeams(teams: Team[]) {
    teams.forEach(team => this.addTeam(team));
  }

  importCitizens(citizens: Citizen[]) {
    citizens.forEach(citizen => this.addCitizen(citizen));
  }

  importFighters(fighters: Fighters[]) {
    fighters.forEach(fighter => this.addFighter(fighter));
  }

  addTeam(team: Team) {
    this.teams.push(team);
    this.registerAgent(team.hq, this.hqs);
  }

  addCitizen(newCitizen: Citizen) {
    this.registerAgent(newCitizen, this.citizens);
  }

  addFighter(newFighter: Fighters) {
    this.registerAgent(newFighter, this.fighters);
  }

  registerAgent(agent: Agent, mapping: { [key: string]: Agent }) {
    this.lookup[agent.id] = agent;
    this.registerAgentPosition(agent, mapping);
  }

  registerAgentPosition(agent: Agent, mapping: { [key: string]: Agent }) {
    agent.covering.forEach(position => {
      mapping[position.key] = agent;
      this.pathFinder.blockPosition(position);
    });
  }

  clearAgentPosition(agent: Agent, mapping: { [key: string]: Agent }) {
    agent.covering.forEach(position => {
      delete mapping[position.key];
    });
    this.pathFinder.clearPosition(agent.position);
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

  isValidPosition(position: Position, teamId: string = null) {
    if (
      position.x >= this.width ||
      position.x < 0 ||
      position.y >= this.height ||
      position.y < 0
    ) {
      return false;
    }
    if (this.walls[position.key]) {
      return false;
    }
    if (this.citizens[position.key]) {
      return false;
    }
    if (this.fighters[position.key]) {
      return false;
    }
    const hq = this.hqs[position.key];
    if (hq && hq.team.id != teamId) {
      return false;
    }
    return true;
  }

  isValidAttackPosition(position: Position, teamId: string) {
    if (!teamId) return false;
    if (
      position.x >= this.width ||
      position.x < 0 ||
      position.y >= this.height ||
      position.y < 0
    ) {
      return false;
    }
    if (this.walls[position.key]) {
      return false;
    }
    const citizen = this.citizens[position.key];
    if (citizen && citizen.teamId != teamId) {
      return true;
    }
    const fighter = this.fighters[position.key];
    if (fighter && fighter.teamId != teamId) {
      return true;
    }
    const hq = this.hqs[position.key];
    if (hq && hq.team.id != teamId) {
      return true;
    }
    return false;
  }

  async executeTurn(actions: Action[] | Action = []) {
    if (this.isOver) return false;

    actions = Array.isArray(actions) ? actions : [actions];

    // Start new turn and history
    this.turn += 1;
    // Apply actions
    await this.applyActions(shuffle(actions));
    return this.actionHistory.getActions(this.turn);
  }

  async applyActions(actions: Action[] = []) {
    // Create action queues
    const attacks: Action[] = [];
    const moves: Action[] = [];
    const spawns: Action[] = [];
    const foodPickUps: Action[] = [];
    const foodDropOffs: Action[] = [];
    // Create map for ensuring one action per agent
    const agentActionMap: { [id: string]: Action } = {};
    console.log("I'm here");
    // Assign actions to queues
    actions.forEach(action => {
      // Do nothing if action is invalid or agent already has an action this turn
      if (!action || !action.type || agentActionMap[action.agent.id])
        return null;
      if (action.type == "attack") {
        agentActionMap[action.agent.id] = action;
        attacks.push(action);
      } else if (action.type == "move") {
        agentActionMap[action.agent.id] = action;
        moves.push(action);
      } else if (action.type === "pickUpFood") {
        agentActionMap[action.agent.id] = action;
        foodPickUps.push(action);
      } else if (action.type === "dropOffFood") {
        agentActionMap[action.agent.id] = action;
        foodDropOffs.push(action);
      } else {
        agentActionMap[action.agent.id] = action;
        spawns.push(action);
      }
    });

    console.log(attacks);
    // Execute attacks in order
    await attacks.reduce(
      (promise, action) => promise.then(() => this.executeAttack(action)),
      Promise.resolve()
    );
    // Execute food pick ups in order
    await foodPickUps.reduce(
      (promise, action) => promise.then(() => this.executeFoodPickUp(action)),
      Promise.resolve()
    );
    // Execute food drop offs in order
    await foodDropOffs.reduce(
      (promise, action) => promise.then(() => this.executeFoodDropOff(action)),
      Promise.resolve()
    );
    // Execute moves in order
    await moves.reduce(
      (promise, action) => promise.then(() => this.executeMove(action)),
      Promise.resolve()
    );
    // Execute spawns in order
    await spawns.reduce(
      (promise, action) => promise.then(() => this.executeSpawn(action)),
      Promise.resolve()
    );
  }

  async executeAttack(action: Action) {
    console.log("EXECUTE ATTACK");
    if (action.type !== "attack" || !action.args.position) return false;
    const fighter = this.lookup[action.agent.id] as Fighters | HQ;
    const attackPosition = new Position(
      action.args.position.x,
      action.args.position.y
    );
    const target =
      this.citizens[attackPosition.key] ||
      this.fighters[attackPosition.key] ||
      this.hqs[attackPosition.key];

    console.log(target);
    if (!target) return false; // miss!
    if (!fighter.isValidAttack(attackPosition)) return false;
    console.log("FIN");
    target.takeDamage(fighter.attackDamage(target));
    console.log(target, fighter.attackDamage(target));
    this.actionHistory.pushActions(this.turn, action);
  }

  async executeMove(action: Action) {
    if (action.type !== "move") return false;
    const agent = this.lookup[action.agent.id] as Citizen | Fighters;
    if (!agent || agent.hp <= 0) return false;
    const newPosition = new Position(
      action.args.position.x,
      action.args.position.y
    );
    if (!agent.isValidMove(newPosition)) return false;
    if (agent.class == "Citizen") {
      this.handleCitizenMove(
        agent as Citizen,
        newPosition,
        action.args.autoPickUpFood || false,
        action.args.autoDropOffFood || false
      );
    } else {
      console.log("HERE 2");
      this.handleFighterMove(agent as Fighters, newPosition);
    }
    this.actionHistory.pushActions(this.turn, action);
  }

  async executeFoodDropOff(action: Action) {
    if (action.type !== "dropOffFood") return false;
    const agent = this.lookup[action.agent.id] as Citizen;
    if (!agent || agent.hp <= 0 || agent.class != "Citizen" || !agent.food)
      return false;
    const dropOffPosition = new Position(
      action.args.position.x,
      action.args.position.y
    );
    if (!agent.isValidMove(dropOffPosition) || this.foods[dropOffPosition.key])
      return false;
    const hq = this.hqs[dropOffPosition.key];
    const food = agent.food;
    agent.dropOffFood();
    if (hq) {
      hq.eatFood();
      food.getEatenBy(hq);
    } else {
      food.eatenById = null;
      food.move(dropOffPosition);
      this.foods[dropOffPosition.key] = food;
    }
    this.actionHistory.pushActions(this.turn, action);
  }

  async executeFoodPickUp(action: Action) {
    if (action.type !== "pickUpFood") return false;
    const agent = this.lookup[action.agent.id] as Citizen;
    if (!agent || agent.hp <= 0 || agent.class !== "Citizen" || agent.food)
      return false;
    const pickUpPosition = new Position(
      action.args.position.x,
      action.args.position.y
    );
    const food = this.foods[pickUpPosition.key];
    if (
      !agent.position.adjacents.find(
        position =>
          pickUpPosition.x == position.x && pickUpPosition.y == position.y
      )
    )
      return false;
    if (food) {
      agent.eatFood(food);
      food.getEatenBy(agent);
      delete this.foods[food.key]; // Un-register food
    }
    this.actionHistory.pushActions(this.turn, action);
  }

  handleCitizenMove(
    citizen: Citizen,
    position: Position,
    autoPickUpFood: boolean,
    autoDropOffFood: boolean
  ) {
    // Move citizen
    this.clearAgentPosition(citizen, this.citizens);
    citizen.move(position);
    this.registerAgentPosition(citizen, this.citizens);
    // Move citizen's food (if applicable)
    const citizenFood = citizen.food;
    if (citizenFood) citizenFood.move(position);
    // Pick up food
    const food = this.foods[citizen.key];
    if (food && !citizen.food && autoPickUpFood) {
      citizen.eatFood(food);
      food.getEatenBy(citizen);
      delete this.foods[food.key]; // Un-register food
    }
    // Drop off food
    const hq = this.hqs[citizen.key];
    if (hq && citizen.food && autoDropOffFood) {
      const food = citizen.food;
      citizen.dropOffFood();
      hq.eatFood();
      food.getEatenBy(hq);
    }
  }

  handleFighterMove(fighter: Fighters, position: Position) {
    console.log(fighter.position, this.fighters);

    this.clearAgentPosition(fighter, this.fighters);
    console.log(fighter.position, this.fighters);

    fighter.move(position);
    console.log(fighter.position, this.fighters);
    this.registerAgentPosition(fighter, this.fighters);
    console.log(fighter.position, this.fighters);
  }

  async executeSpawn(action: Action) {
    if (action.type == "spawnCitizen") {
      this.spawnCitizen(action.agent as HQ);
    } else if (action.type == "spawnFighter") {
      this.spawnFighter(action.agent as HQ, {
        fighterType: action.args.fighterType,
        skipFood: false
      });
    }
  }

  spawnCitizen(hq: HQ, props: { skipFood?: boolean } = {}) {
    const { team } = hq;
    if (team.pop >= this.maxPop) {
      return false;
    }
    const spawnLocation = hq.nextSpawnPosition;
    if (!spawnLocation) {
      return false;
    }
    if (!props.skipFood && team.foodCount < this.citizenCost) {
      return false; // Insufficient food
    }
    if (!props.skipFood) {
      team.spendFood(this.citizenCost);
    }
    const newCitizen = new Citizen(this, {
      teamId: team.id,
      position: spawnLocation
    });
    this.addCitizen(newCitizen);
  }

  spawnFighter(
    hq: HQ,
    props: { skipFood?: boolean; fighterType?: FighterType } = {
      skipFood: false,
      fighterType: "infantry"
    }
  ) {
    const { team } = hq;
    if (team.pop >= this.maxPop) {
      return false;
    }
    const spawnLocation = hq.nextSpawnPosition;
    if (!spawnLocation) {
      return false;
    }
    let newFighter;

    if (props.fighterType === "cavalry")
      newFighter = new CavalryFighter(this, {
        teamId: team.id,
        position: spawnLocation
      });
    else if (props.fighterType === "ranged")
      newFighter = new RangedFighter(this, {
        teamId: team.id,
        position: spawnLocation
      });
    else if (props.fighterType === "infantry")
      newFighter = new InfantryFighter(this, {
        teamId: team.id,
        position: spawnLocation
      });

    if (!props.skipFood && team.foodCount < newFighter.cost) {
      return false; // Insufficient food
    }
    if (!props.skipFood) {
      team.spendFood(this.citizenCost);
    }
    this.addFighter(newFighter);
  }

  killFighter(fighter: Fighters) {
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
}
