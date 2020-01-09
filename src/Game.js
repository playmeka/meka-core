import { observable, action, computed } from "mobx";
import ObjectWithPosition, {
  Position,
  randomPosition
} from "./ObjectWithPosition";
import shuffle from "lodash/shuffle";
import Team from "./Team";
import Citizen from "./Citizen";
import Fighter from "./Fighter";
import Lambda from "aws-sdk/clients/lambda";

export class Wall extends ObjectWithPosition {
  class = "Wall";
}

export class Food extends ObjectWithPosition {
  class = "Food";

  @observable eatenBy = null;
  // TODO:
  // - position can change
  // - collected by team
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
  @observable autoTick = false;
  @observable turn = 1;
  @observable tickTimeMean = 0;
  @observable isOver = false;
  @observable actionHistory = [[]];
  @observable lookup = {};

  constructor(props = {}) {
    this.width = props.width;
    this.height = props.height;
    this.maxPop = props.maxPop || Math.floor(this.width * this.height * 0.1);
    this.tickTimer = null;
    this.tickTime = props.tickTime || 200;
    this.lambda = new Lambda({
      region: "us-west-2",
      credentials: props.awsCredentials
    });
    this.citizenCost = props.citizenCost || 2;
    this.fighterCost = props.fighterCost || 4;
    // Setup teams
    this.createTeams();
    // Setup board
    const wallCount =
      props.wallCount || Math.floor(this.width * this.height * 0.2);
    this.createWalls(wallCount);
    // Add food
    const foodCount =
      props.foodCount || Math.floor(this.width * this.height * 0.2);
    for (let i = 0; i < foodCount; i++) {
      this.addFood(randomPosition(this.width, this.height));
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

  @computed get foodLeft() {
    return this.foodsList.filter(food => !food.eatenBy).length;
  }

  // TODO: add walls, food, and more
  toJSON() {
    return {
      teams: this.teams.map(team => team.toJSON()),
      width: this.width,
      height: this.height
    };
  }

  exit() {
    clearTimeout(this.tickTimer);
  }

  createTeams() {
    const homeTeam = new Team(this, {
      id: "home",
      color: "blue",
      maxPop: this.maxPop,
      hq: { x: this.width - 4, y: 2 } // Top right
    });
    this.addTeam(homeTeam);
    this.spawnCitizen(homeTeam.hq, { skipFood: true });
    const awayTeam = new Team(this, {
      id: "away",
      color: "red",
      maxPop: this.maxPop,
      hq: { x: 2, y: this.height - 4 } // Bottom left
    });
    this.addTeam(awayTeam);
    this.spawnCitizen(awayTeam.hq, { skipFood: true });
  }

  addTeam(team) {
    this.teams.push(team);
    this.registerAgent(team.hq, this.hqs);
  }

  addCitizen(newCitizen) {
    console.log(newCitizen);
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
      this.addWall(randomPosition(this.width, this.height));
    }
  }

  addWall(props = {}) {
    const newWall = new Wall({ ...props });
    if (this.walls[newWall.key]) {
      return false;
    }
    this.walls[newWall.key] = newWall;
  }

  addFood(props = {}) {
    const newFood = new Food({ ...props });
    if (!this.isValidMove(newFood.position)) {
      return false;
    }
    this.foods[newFood.key] = newFood;
  }

  @action play() {
    this.autoTick = true;
    this.tick();
  }

  @action stop() {
    this.autoTick = false;
    clearTimeout(this.tickTimer);
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

  @action async tick() {
    const tickTimeStart = performance.now();
    this.actionHistory.push([]); // Start new history for tick
    const attacks = [];
    const moves = [];
    const spawns = [];
    const promises = this.teams.map(team => {
      return this.getNextActionsWithTimeout(team, 250).then(actions => {
        actions.forEach(action => {
          if (!action || !action.type) {
            return null;
          }
          if (action.type == "attack") {
            attacks.push(action);
          } else if (action.type == "move") {
            moves.push(action);
          } else {
            spawns.push(action);
          }
        });
      });
    });
    await Promise.all(promises);
    console.log("TICK", attacks, moves, spawns);
    await Promise.all(
      shuffle(attacks).map(action => this.executeAction(action))
    );
    await Promise.all(shuffle(moves).map(action => this.executeAction(action)));
    await Promise.all(
      shuffle(spawns).map(action => this.executeAction(action))
    );
    const tickTimeEnd = performance.now();
    this.tickTimeMean =
      (this.tickTimeMean * (this.turn - 1) + (tickTimeEnd - tickTimeStart)) /
      this.turn;
    this.turn += 1;
    if (this.autoTick && !this.isOver) {
      this.tickTimer = setTimeout(() => this.tick(), this.tickTime);
    }
  }

  getNextActionsWithTimeout(team, timeout) {
    return new Promise(async (resolve, reject) => {
      // const timer = setTimeout(() => {
      //   console.log("TIMEOUT");
      //   reject([]);
      // }, timeout);
      const lambdaParams = {
        FunctionName:
          "arn:aws:lambda:us-west-2:310221343320:function:battle-basic-greedy",
        Payload: JSON.stringify({
          game: this.toJSON(),
          team: team.toJSON()
        })
      };
      this.lambda.invoke(lambdaParams, (err, data) => {
        if (data.StatusCode == 200) {
          const actions = JSON.parse(data.Payload);
          resolve(actions);
        }
      });
    });
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

  @action killHQ(hq) {
    console.log("GAME OVER");
    this.isOver = true;
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
