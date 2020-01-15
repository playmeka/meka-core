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

export class Wall extends ObjectWithPosition {
  class = "Wall";

  static fromJSON(json) {
    return new Wall(json);
  }
}

export class Food extends ObjectWithPosition {
  class = "Food";

  @observable eatenBy = null;

  constructor(props = {}) {
    super(props);
    this.eatenBy = props.eatenBy;
  }

  static fromJSON(json) {
    return new Food(json);
  }

  toJSON() {
    const { id, width, height, eatenBy } = this;
    return {
      id,
      width,
      height,
      position: this.position.toJSON()
    };
  }
}

export class Action {
  constructor(agent, actionType, args = {}) {
    this.agent = agent;
    this.type = actionType;
    this.args = args;
  }

  // TODO improve serialization
  toJSON() {
    return {
      agent: { class: this.agent.class, id: this.agent.id },
      type: this.type,
      args: this.args
    };
  }
}

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
    this.turn = props.turn || 1;
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
        props.wallCount || Math.floor(this.width * this.height * 0.2);
      this.createWalls(wallCount);
    }
    // Setup food
    if (props.foods) {
      this.importFoods(props.foods);
    } else {
      const foodCount =
        props.foodCount || Math.floor(this.width * this.height * 0.2);
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
    this.teams.forEach(team => {
      if (team.hq.hp <= 0) {
        return true;
      }
    });
    return false;
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
    console.log("Create walls", wallCount);
    for (let i = 0; i < wallCount; i++) {
      const newWall = new Wall(randomPosition(this.width, this.height));
      if (!this.walls[newWall.key]) this.addWall(newWall);
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
      const food = Food.fromJSON(foodJson);
      this.addFood(food);
    });
  }

  createFoods(foodCount) {
    for (let i = 0; i < foodCount; i++) {
      const newFood = new Food(randomPosition(this.width, this.height));
      if (this.isValidMove(newFood.position)) this.addFood(newFood);
    }
  }

  addFood(newFood) {
    this.foods[newFood.key] = newFood;
  }

  isValidMove(position, team = null) {
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
    if (hq && hq.team.id != (team || {}).id) {
      return false;
    }
    return true;
  }

  async executeTurn(actions = []) {
    this.turn += 1;
    this.actionHistory.push([]); // Start new history for tick
    const attacks = [];
    const moves = [];
    const spawns = [];
    // Assign actions to queus
    actions.forEach(action => {
      if (!action || !action.type) return null;
      if (action.type == "attack") {
        attacks.push(action);
      } else if (action.type == "move") {
        moves.push(action);
      } else {
        spawns.push(action);
      }
    });
    await Promise.all(
      shuffle(attacks).map(action => this.executeAction(action))
    );
    await Promise.all(shuffle(moves).map(action => this.executeAction(action)));
    await Promise.all(
      shuffle(spawns).map(action => this.executeAction(action))
    );
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

  executeAttack(fighter, args = {}) {
    const target =
      this.citizens[args.position.key] ||
      this.fighters[args.position.key] ||
      this.hqs[args.position.key];
    if (!target) {
      return false; // miss!
    }
    target.takeDamage(fighter.attackDamage);
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

  @action killFighter(fighter) {
    this.fighters[fighter.key] = null;
  }

  @action killCitizen(citizen) {
    if (citizen.food) {
      // TODO: abstract food dropping
      const food = citizen.food;
      citizen.food = null;
      this.foods[food.key] = null;
      food.eatenBy = null;
      food.position.x = citizen.x;
      food.position.y = citizen.y;
      this.foods[food.key] = food;
    }
    this.citizens[citizen.key] = null;
  }

  killHQ(hq) {
    console.log("GAME OVER");
  }

  executeMove(agent, args = {}) {
    const newPosition = new Position(args.position.x, args.position.y);
    if (!this.isValidMove(newPosition, agent.team) || agent.hp <= 0) {
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

  @action handleCitizenMove(citizen, position) {
    this.citizens[citizen.key] = null;
    citizen.move(position);
    this.citizens[citizen.key] = citizen;
    const food = this.foods[citizen.key];
    if (food && !food.eatenBy && !citizen.food) {
      citizen.eatFood(food);
      food.eatenBy = citizen;
    }
    const hq = this.hqs[citizen.key];
    if (hq && citizen.food) {
      citizen.dropFood(food);
    }
  }

  @action handleFighterMove(fighter, position) {
    this.fighters[fighter.key] = null;
    fighter.move(position);
    this.fighters[fighter.key] = fighter;
  }
}
