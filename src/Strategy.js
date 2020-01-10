import uuid from "uuid/v1";

export default class Strategy {
  constructor(actionFunction, props = {}) {
    this.id = `${uuid()}@Strategy`;
    this.getNextActions = actionFunction;
  }
}
