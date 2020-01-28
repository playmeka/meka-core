import Game from "./Game";
import Action, { ActionJSON } from "./Action";

export type ActionHistoryJSON = { [turn: string]: ActionJSON[] };
type ActionsByTurnMap = { [turn: string]: Action[] };

export default class ActionHistory {
  actionsByTurn: ActionsByTurnMap;
  game: Game;

  constructor(game: Game, props: { actionsByTurn?: ActionsByTurnMap } = {}) {
    this.game = game;
    this.actionsByTurn = props.actionsByTurn || {};
  }

  getActions(turn: number | string) {
    return this.actionsByTurn[turn];
  }

  pushActions(turn: number | string, ...actions: Action[]) {
    if (!this.actionsByTurn[turn]) {
      this.actionsByTurn[turn] = [];
    }
    return this.actionsByTurn[turn].push(...actions);
  }

  toArray() {
    const array: { turn: number; actions: Action[] }[] = [];
    for (let i = 0; i <= this.game.turn; i++) {
      array.push({ turn: i, actions: this.getActions(i) });
    }
    return array;
  }

  toJSON() {
    const json: ActionHistoryJSON = {};
    Object.keys(this.actionsByTurn).forEach(turn => {
      json[turn] = this.actionsByTurn[turn].map(action => action.toJSON());
    });
    return json;
  }

  static fromJSON(game: Game, json: { [turn: string]: ActionJSON[] }) {
    const actionsByTurn: ActionsByTurnMap = {};
    Object.keys(json).forEach(turn => {
      actionsByTurn[turn] = json[turn].map(actionJson =>
        Action.fromJSON(game, actionJson)
      );
    });
    return new ActionHistory(game, { actionsByTurn });
  }
}
