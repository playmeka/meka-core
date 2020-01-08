import { observable, action, computed } from "mobx";
import ObjectWithPosition, {
  Position,
  randomPosition
} from "./ObjectWithPosition";
import shuffle from "lodash/shuffle";
import Citizen from "./Citizen";
import Fighter from "./Fighter";
import { Action } from "./Battle";
import HQ from "./HQ";

export default class Team {
  @observable foodCount = 0;

  constructor(battle, props = {}) {
    this.battle = battle;
    this.id = props.id || Math.floor(Math.random() * 10000);
    this.color = props.color || "blue";
    this.maxPop = props.maxPop;
    this.hq = new HQ(this, props.hq);
    // Spawn initial citizens
    const citizenCount = props.citizenCount || 1;
    for (let i = 0; i < citizenCount; i++) {
      this.spawnCitizen(true);
    }
    // this.spawnFighter(true);
  }

  @computed get pop() {
    return this.citizens.length + this.fighters.length;
  }

  @computed get citizens() {
    return this.battle.citizensList.filter(
      citizen => citizen.team.id == this.id
    );
  }

  @computed get fighters() {
    return this.battle.fightersList.filter(
      fighter => fighter.team.id == this.id
    );
  }

  toJSON() {
    return {
      id: this.id,
      color: this.color,
      citizens: this.citizens.map(citizen => citizen.toJSON()),
      fighters: this.fighters.map(fighter => fighter.toJSON())
    };
  }

  getNextActions() {
    return [];
  }

  spawnCitizen(skipFood = false) {
    if (this.pop >= this.maxPop) {
      return false;
    }
    const spawnLocation = this.hq.nextSpawnPosition;
    if (!spawnLocation) {
      return false;
    }
    if (!skipFood && this.foodCount < 2) {
      return false;
    }
    if (!skipFood) {
      this.foodCount -= 2;
    }
    const newCitizen = new Citizen(this, { ...spawnLocation });
    this.battle.addCitizen(newCitizen);
  }

  spawnFighter(skipFood = false) {
    if (this.pop >= this.maxPop) {
      return false;
    }
    // Spend food
    const spawnLocation = this.hq.nextSpawnPosition;
    if (!spawnLocation) {
      return false;
    }
    if (!skipFood && this.foodCount < 4) {
      return false;
    }
    if (!skipFood) {
      this.foodCount -= 4;
    }
    const newFighter = new Fighter(this, { ...spawnLocation });
    this.battle.addFighter(newFighter);
  }

  addFood(newFood) {
    this.foodCount += 1;
  }
}
