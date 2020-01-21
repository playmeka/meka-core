import ObjectWithPosition, {
  Position,
  randomPosition
} from "./ObjectWithPosition";
import shuffle from "./utils/shuffle";
import Team from "./Team";
import Citizen from "./Citizen";
import Fighter from "./Fighter";
import Wall from "./Wall";
import Food from "./Food";
import Action, { ActionType } from "./Action";
import HQ from "./HQ";

export type Agent = Citizen | Fighter | HQ;

export default class Game {
  teams: Team[] = [];
  hqs: { [key: string]: HQ } = {};
  citizens: { [key: string]: Citizen } = {};
  fighters: { [key: string]: Fighter } = {};
  foods: { [key: string]: Food } = {};
  walls: { [key: string]: Wall } = {};
  actionHistory: Action[][] = [[]];
  lookup: { [id: string]: Agent | Food } = {};
  homeId: string;
  awayId: string;
  width: number;
  height: number;
  turn: number;
  maxTurns: number;
  maxPop: number;
  citizenCost: number;
  fighterCost: number;
  wallCount: number;
  foodCount: number;

  constructor(
    props: {
      homeId?: string;
      awayId?: string;
      width?: number;
      height?: number;
      turn?: number;
      maxTurns?: number;
      maxPop?: number;
      citizenCost?: number;
      fighterCost?: number;
      teams?: Team[];
      walls?: Wall[];
      foods?: Food[];
      wallCount?: number;
      foodCount?: number;
    } = {}
  ) {
    this.homeId = props.homeId;
    this.awayId = props.awayId;
    this.width = props.width;
    this.height = props.height;
    this.turn = props.turn || 0;
    this.maxTurns = props.maxTurns;
    this.maxPop = props.maxPop || Math.floor(this.width * this.height * 0.1);
    this.citizenCost = props.citizenCost || 2;
    this.fighterCost = props.fighterCost || 4;
    // Setup teams
    if (props.teams) {
      this.importTeams(props.teams);
    } else {
      this.createTeams();
    }
    // Setup board
    if (props.walls) {
      this.importWalls(props.walls);
    } else {
      const wallCount =
        props.wallCount == 0 || props.wallCount
          ? props.wallCount
          : props.wallCount || Math.floor(this.width * this.height * 0.2);
      this.createWalls(wallCount);
    }
    // Setup food
    if (props.foods) {
      this.importFoods(props.foods);
    } else {
      const foodCount =
        props.foodCount == 0 || props.foodCount
          ? props.foodCount
          : Math.floor(this.width * this.height * 0.2);
      this.createFoods(foodCount);
    }
  }

  get wallsList() {
    return Object.values(this.walls);
  }

  get foodsList() {
    return Object.values(this.foods).filter(food => !!food);
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

  toJSON() {
    const {
      width,
      height,
      maxTurns,
      maxPop,
      citizenCost,
      fighterCost,
      wallCount,
      foodCount,
      homeId,
      awayId,
      turn
    } = this;
    return {
      width,
      height,
      maxTurns,
      maxPop,
      turn,
      citizenCost,
      fighterCost,
      wallCount,
      foodCount,
      homeId,
      awayId,
      walls: this.wallsList.map(wall => wall.toJSON()),
      foods: this.foodsList.map(food => food.toJSON()),
      teams: this.teams.map(team => team.toJSON()),
      actionHistory: this.actionHistory.map((action: any) => action.toJSON()) // TODO
    };
  }

  static fromJSON(json: any) {
    return new Game(json);
  }

  createTeams() {
    const homeTeam = new Team(this, {
      id: this.homeId,
      color: "blue",
      hq: { position: new Position(this.width - 4, 2), teamId: this.homeId } // Top right
    });
    this.addTeam(homeTeam);
    this.spawnCitizen(homeTeam.hq, { skipFood: true });
    const awayTeam = new Team(this, {
      id: this.awayId,
      color: "red",
      hq: { teamId: this.awayId, position: new Position(2, this.height - 4) } // Bottom left
    });
    this.addTeam(awayTeam);
    this.spawnCitizen(awayTeam.hq, { skipFood: true });
  }

  importTeams(teams: Team[]) {
    teams.forEach(teamJson => {
      const team = Team.fromJSON(this, teamJson);
      this.addTeam(team);
      teamJson.citizens.forEach(citizenJson => {
        const newCitizen = new Citizen(team, citizenJson);
        this.addCitizen(newCitizen);
      });
      teamJson.fighters.forEach(fighterJson => {
        const newFighter = new Fighter(team, fighterJson);
        this.addFighter(newFighter);
      });
    });
  }

  addTeam(team: Team) {
    this.teams.push(team);
    this.registerAgent(team.hq, this.hqs);
  }

  getTeam(teamId: string) {
    return this.teams.filter(team => team.id == teamId)[0];
  }

  addCitizen(newCitizen: Citizen) {
    this.registerAgent(newCitizen, this.citizens);
  }

  addFighter(newFighter: Fighter) {
    this.registerAgent(newFighter, this.fighters);
  }

  registerAgent(agent: Agent, mapping: { [key: string]: Agent }) {
    this.lookup[agent.id] = agent;
    agent.covering.forEach(position => {
      mapping[position.key] = agent;
    });
  }

  createWalls(wallCount: number) {
    for (let i = 0; i < wallCount; i++) {
      this.createRandomWall();
    }
  }

  createRandomWall() {
    const newWall = new Wall({
      position: randomPosition(this.width, this.height)
    });
    if (this.walls[newWall.key] || this.hqs[newWall.key]) {
      this.createRandomWall();
    } else {
      this.addWall(newWall);
    }
  }

  importWalls(walls: Wall[]) {
    walls.forEach(wallJson => {
      const wall = Wall.fromJSON(wallJson);
      this.addWall(wall);
    });
  }

  addWall(newWall: Wall) {
    this.walls[newWall.key] = newWall;
  }

  importFoods(foods: Food[]) {
    foods.forEach(foodJson => {
      const food = Food.fromJSON(this, foodJson);
      this.addFood(food);
    });
  }

  createFoods(foodCount: number) {
    for (let i = 0; i < foodCount; i++) {
      this.createRandomFood();
    }
  }

  createRandomFood() {
    const newFood = new Food(this, {
      position: randomPosition(this.width, this.height)
    });
    if (this.isValidMove(newFood.position)) {
      this.addFood(newFood);
    } else {
      this.createRandomFood();
    }
  }

  addFood(newFood: Food) {
    this.foods[newFood.key] = newFood;
    this.lookup[newFood.id] = newFood;
  }

  isValidMove(rawPosition: { x: number; y: number }, teamId: string = null) {
    const position = new Position(rawPosition.x, rawPosition.y);
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

  async executeTurn(actions: Action[] = []) {
    if (this.isOver) return false;
    // Start new turn and history
    this.turn += 1;
    this.actionHistory.push([]);
    // Create action queues
    const attacks: Action[] = [];
    const moves: Action[] = [];
    const spawns: Action[] = [];
    // Create map for ensuring one action per agent
    const agentActionMap = {};
    // Assign actions to queues
    shuffle(actions).forEach(action => {
      // Do nothing if action is invalid or agent already has an action this turn
      if (!action || !action.type || agentActionMap[action.agent.id])
        return null;
      if (action.type == "attack") {
        agentActionMap[action.agent.id] = action;
        attacks.push(action);
      } else if (action.type == "move") {
        agentActionMap[action.agent.id] = action;
        moves.push(action);
      } else {
        agentActionMap[action.agent.id] = action;
        spawns.push(action);
      }
    });
    // Execute attacks, moves, spawns in order
    await Promise.all(attacks.map(action => this.executeAttack(action)));
    await Promise.all(moves.map(action => this.executeMove(action)));
    await Promise.all(spawns.map(action => this.executeSpawn(action)));
    return true;
  }

  // Action(agent, type, args)
  executeAction(action: Action) {
    const actionFunctionMap = {
      move: (agent: Citizen | Fighter, args: any) =>
        this.executeMove(agent, args),
      attack: (fighter: Fighter, args: any) =>
        this.executeAttack(fighter, args),
      spawnCitizen: (hq: HQ, _args: any) => this.spawnCitizen(hq),
      spawnFighter: (hq: HQ, _args: any) => this.spawnFighter(hq)
    };
    // TODO
    const agent = this.lookup[action.agent.id] as any;
    if (!agent) return false;
    return new Promise((resolve, _reject) => {
      const actionFunction = actionFunctionMap[action.type];
      actionFunction(agent, action.args);
      this.actionHistory[this.turn].push(action);
      resolve(true);
    });
  }

  executeAttack(action: Action) {
    if (action.type != "attack") return false;
    const fighter = this.lookup[action.agent.id];
    const position = new Position(args.position.x, args.position.y);
    const target =
      this.citizens[position.key] ||
      this.fighters[position.key] ||
      this.hqs[position.key];
    if (!target) return false; // miss!
    target.takeDamage(fighter.attackDamage);
    this.actionHistory[this.turn].push(action);
  }

  executeMove(action) {
    if (action.type != "move") return false;
    const agent = this.lookup[action.agent.id];
    if (!agent) return false;
    const newPosition = new Position(
      action.args.position.x,
      action.args.position.y
    );
    if (!this.isValidMove(newPosition, agent.team.id) || agent.hp <= 0) {
      return false;
    }
    if (agent.class == "Citizen") {
      this.handleCitizenMove(agent, newPosition);
    }
    if (agent.class == "Fighter") {
      this.handleFighterMove(agent, newPosition);
    }
    return true;
  }

  handleCitizenMove(citizen: Citizen, position: Position) {
    // Move citizen
    this.citizens[citizen.key] = null;
    citizen.move(position);
    this.citizens[citizen.key] = citizen;
    // Move citizen's food (if applicable)
    const citizenFood = citizen.food;
    if (citizenFood) {
      this.foods[citizenFood.key] = null;
      citizenFood.move(position);
      this.foods[citizenFood.key] = citizenFood;
    }
    // Pick up food
    const food = this.foods[citizen.key];
    if (food && !food.eatenBy && !citizen.food) {
      citizen.eatFood(food);
      food.getEatenBy(citizen);
    }
    // Drop off food
    const hq = this.hqs[citizen.key];
    if (hq && citizen.food) {
      const food = citizen.food;
      citizen.dropOffFood();
      hq.eatFood(food);
      food.getEatenBy(hq);
      this.foods[food.key] = null; // Unregister food
    }
  }

  handleFighterMove(fighter: Fighter, position: Position) {
    this.fighters[fighter.key] = null;
    fighter.move(position);
    this.fighters[fighter.key] = fighter;
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
    const newCitizen = new Citizen(team, { position: spawnLocation });
    this.addCitizen(newCitizen);
  }

  spawnFighter(hq: HQ, props: { skipFood?: boolean } = {}) {
    const { team } = hq;
    if (team.pop >= this.maxPop) {
      return false;
    }
    const spawnLocation = hq.nextSpawnPosition;
    if (!spawnLocation) {
      return false;
    }
    if (!props.skipFood && team.foodCount < this.fighterCost) {
      return false;
    }
    if (!props.skipFood) {
      team.spendFood(this.fighterCost);
    }
    const newFighter = new Fighter(team, { position: spawnLocation });
    this.addFighter(newFighter);
  }

  killFighter(fighter: Fighter) {
    this.fighters[fighter.key] = null;
  }

  killCitizen(citizen: Citizen) {
    const food = citizen.food;
    this.citizens[citizen.key] = null;
    if (food) {
      citizen.dropOffFood();
      food.eatenById = null;
      this.foods[food.key] = food;
    }
  }
}
