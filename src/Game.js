import { observable, action, computed, observe, when } from "mobx";
import ObjectWithPosition, {
  Position,
  randomPosition
} from "./ObjectWithPosition";
import shuffle from "lodash/shuffle";
import now from "performance-now";
import Team from "./Team";
import Citizen from "./Citizen";
import Fighter from "./Fighter";
import Wall from "./Wall";
import Food from "./Food";
import Action from "./Action";

export default class Game {
  @observable teams = [];
  @observable hqs = {};
  @observable citizens = {};
  @observable fighters = {};
  @observable foods = {};
  @observable walls = {};
  @observable turn;
  @observable actionHistory = [[]];
  @observable lookup = {};

  constructor(props = {}) {
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

  @computed get wallsList() {
    return Object.values(this.walls);
  }

  @computed get foodsList() {
    return Object.values(this.foods).filter(food => !!food);
  }

  @computed get citizensList() {
    return Object.values(this.citizens).filter(citizen => !!citizen);
  }

  @computed get fightersList() {
    return Object.values(this.fighters).filter(fighter => !!fighter);
  }

  @computed get hqsList() {
    return Object.values(this.hqs).filter(hq => !!hq);
  }

  @computed get foodLeft() {
    return this.foodsList.filter(food => !food.eatenBy).length;
  }

  @computed get isOver() {
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
      homeId,
      awayId,
      walls: this.wallsList.map(wall => wall.toJSON()),
      foods: this.foodsList.map(food => food.toJSON()),
      teams: this.teams.map(team => team.toJSON()),
      actionHistory: this.actionHistory.map(action => action.toJSON())
    };
  }

  static fromJSON(json) {
    return new Game(json);
  }

  createTeams() {
    const homeTeam = new Team(this, {
      id: this.homeId,
      color: "blue",
      hq: { x: this.width - 4, y: 2 } // Top right
    });
    this.addTeam(homeTeam);
    this.spawnCitizen(homeTeam.hq, { skipFood: true });
    const awayTeam = new Team(this, {
      id: this.awayId,
      color: "red",
      hq: { x: 2, y: this.height - 4 } // Bottom left
    });
    this.addTeam(awayTeam);
    this.spawnCitizen(awayTeam.hq, { skipFood: true });
  }

  importTeams(teams) {
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

  addTeam(team) {
    this.teams.push(team);
    this.registerAgent(team.hq, this.hqs);
  }

  getTeam(teamId) {
    return this.teams.filter(team => team.id == teamId)[0];
  }

  addCitizen(newCitizen) {
    this.registerAgent(newCitizen, this.citizens);
  }

  addFighter(newFighter) {
    this.registerAgent(newFighter, this.fighters);
  }

  registerAgent(agent, mapping) {
    this.lookup[agent.id] = agent;
    agent.covering.forEach(position => {
      mapping[position.key] = agent;
    });
  }

  createWalls(wallCount) {
    for (let i = 0; i < wallCount; i++) {
      this.createRandomWall();
    }
  }

  createRandomWall() {
    const newWall = new Wall(randomPosition(this.width, this.height));
    if (this.walls[newWall.key] || this.hqs[newWall.key]) {
      this.createRandomWall();
    } else {
      this.addWall(newWall);
    }
  }

  importWalls(walls) {
    walls.forEach(wallJson => {
      const wall = Wall.fromJSON(wallJson);
      this.addWall(wall);
    });
  }

  addWall(newWall) {
    this.walls[newWall.key] = newWall;
  }

  importFoods(foods) {
    foods.forEach(foodJson => {
      const food = Food.fromJSON(this, foodJson);
      this.addFood(food);
    });
  }

  createFoods(foodCount) {
    for (let i = 0; i < foodCount; i++) {
      this.createRandomFood();
    }
  }

  createRandomFood() {
    const newFood = new Food(this, randomPosition(this.width, this.height));
    if (this.isValidMove(newFood.position)) {
      this.addFood(newFood);
    } else {
      this.createRandomFood();
    }
  }

  addFood(newFood) {
    this.foods[newFood.key] = newFood;
    this.lookup[newFood.id] = newFood;
  }

  isInBounds(position) {
    return (
      position.x < this.width &&
      position.x >= 0 &&
      position.y < this.height &&
      position.y >= 0
    );
  }

  isValidMove(rawPosition, teamId = null) {
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

  async executeTurn(actions = []) {
    if (this.isOver) return false;
    // Start new turn and history
    this.turn += 1;
    this.actionHistory.push([]);
    // Create action queues
    const attacks = [];
    const moves = [];
    const spawns = [];
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
  executeAction(action) {
    const actionFunctionMap = {
      move: (agent, args) => this.executeMove(agent, args),
      attack: (fighter, args) => this.executeAttack(fighter, args),
      spawnCitizen: (hq, args) => this.spawnCitizen(hq),
      spawnFighter: (hq, args) => this.spawnFighter(hq)
    };
    const agent = this.lookup[action.agent.id];
    if (!agent) return false;
    return new Promise((resolve, reject) => {
      const actionFunction = actionFunctionMap[action.type];
      actionFunction(agent, action.args);
      this.actionHistory[this.turn].push(action);
      resolve(true);
    });
  }

  executeAttack(action) {
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

  handleCitizenMove(citizen, position) {
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

  handleFighterMove(fighter, position) {
    this.fighters[fighter.key] = null;
    fighter.move(position);
    this.fighters[fighter.key] = fighter;
  }

  spawnCitizen(hq, props = {}) {
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
    const newCitizen = new Citizen(team, { ...spawnLocation });
    this.addCitizen(newCitizen);
  }

  spawnFighter(hq, props = {}) {
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
    const newFighter = new Fighter(team, { ...spawnLocation });
    this.addFighter(newFighter);
  }

  killFighter(fighter) {
    this.fighters[fighter.key] = null;
  }

  killCitizen(citizen) {
    const food = citizen.food;
    this.citizens[citizen.key] = null;
    if (food) {
      citizen.dropOffFood();
      food.eatenById = null;
      this.foods[food.key] = food;
    }
  }
}
