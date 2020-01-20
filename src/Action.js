export default class Action {
  constructor(agent, actionType, args = {}) {
    this.agent = agent;
    this.type = actionType;
    this.args = args;
  }

  toJSON() {
    return [this.agent.id, this.type, this.args];
  }

  static fromJSON(game, json) {
    const agent = game.lookup[json[0]];
    return new Action(agent, json[1], json[2]);
  }
}
