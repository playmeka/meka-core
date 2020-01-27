import Game from "./Game";
import Action from "./Action";

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
    // const turnArray: { turn: number; actions: Action[] }[] = [];
    const keys = Object.keys(this.actionsByTurn).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
    return keys.map(turn => ({
      turn: parseInt(turn),
      actions: this.getActions(turn)
    }));
  }

  toJSON() {
    const json: { [turn: string]: Array<any> } = {};
    Object.keys(this.actionsByTurn).forEach(turn => {
      json[turn] = this.actionsByTurn[turn].map(action => action.toJSON());
    });
    return json;
  }

  static fromJSON(game: Game, json: { [turn: string]: Array<any> }) {
    const actionsByTurn: ActionsByTurnMap = {};
    Object.keys(json).forEach(turn => {
      actionsByTurn[turn] = json[turn].map((actionJson: Array<any>) =>
        Action.fromJSON(game, actionJson)
      );
    });
    return new ActionHistory(game, { actionsByTurn });
  }
}
