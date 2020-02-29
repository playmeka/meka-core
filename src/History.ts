import Game from "./Game";
import { Action, ActionJSON, actionFromJSON } from "./actions";

export type HistoryJSON = { [turn: string]: ActionJSON[] };
type ActionsByTurnMap = { [turn: string]: Action[] };

export default class History {
  actionsByTurn: ActionsByTurnMap;
  game: Game;

  constructor(game: Game, props: { actionsByTurn?: ActionsByTurnMap } = {}) {
    this.game = game;
    this.actionsByTurn = props.actionsByTurn || {};
  }

  getActions(turn: number | string) {
    return this.actionsByTurn[turn] || [];
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
    const json: HistoryJSON = {};
    Object.keys(this.actionsByTurn).forEach(turn => {
      json[turn] = this.actionsByTurn[turn].map(action =>
        action.toJSON()
      ) as ActionJSON[];
    });
    return json;
  }

  static fromJSON(game: Game, json: { [turn: string]: ActionJSON[] }) {
    const actionsByTurn: ActionsByTurnMap = {};
    Object.keys(json).forEach(turn => {
      actionsByTurn[turn] = json[turn].map(actionJson =>
        actionFromJSON(game, actionJson)
      );
    });
    return new History(game, { actionsByTurn });
  }
}
