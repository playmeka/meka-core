import Game from "../src/Game";
import Citizen from "../src/Citizen";
import Command from "../src/Command";
import Action from "../src/Action";
import { Position } from "../src/ObjectWithPosition";

const defaultGameProps = {
  width: 10,
  height: 10
};

test("Game constructor returns Game", () => {
  const game = new Game(defaultGameProps);
  expect(game).toBeTruthy();
  expect(game.width).toBe(defaultGameProps.width);
  expect(game.height).toBe(defaultGameProps.height);
  expect(game.turn).toBe(0);
});

test("Game.generate returns Game", () => {
  expect(Game.generate(defaultGameProps)).toBeTruthy();
});

test("Sending invalid spawn command results in failure Action", async () => {
  const game = Game.generate(defaultGameProps);
  const command = new Command(game.teams[0].hq, "spawnCitizen");
  const actions = await game.executeTurn([command]);
  expect(actions.length).toBe(1);
  const action = actions[0];
  expect(action.status).toBe("failure");
  expect(action.error).toBeTruthy();
});

describe("Sending valid move command", () => {
  let game: Game, citizen: Citizen, command: Command, actions: Action[];

  beforeEach(async () => {
    game = Game.generate(defaultGameProps);
    citizen = game.teams[0].citizens[0];
    command = new Command(citizen, "move", { position: citizen.validMoves[0] });
    actions = await game.executeTurn([command]);
  });
  test("returns actions", () => {
    expect(actions.length).toBe(1);
  });
  test("returns success action", () => {
    const action = actions[0];
    expect(action.status).toBe("success");
    expect(action.error).toBeFalsy();
  });
  test("returns mutation with data changes", () => {
    const action = actions[0];
    const { newValue: newCitizen, oldValue: oldCitizen } = action.mutation;
    expect(newCitizen.id).toBe(oldCitizen.id);
    expect(newCitizen.position).not.toBe(oldCitizen.position);
  });

  test("adds action to history", () => {
    const turnHistory = game.history.getActions(game.turn);
    expect(turnHistory.length).toBe(1);
  });
});

describe("Sending invalid move command", () => {
  let game: Game, citizen: Citizen, command: Command, actions: Action[];

  beforeEach(async () => {
    game = Game.generate(defaultGameProps);
    citizen = game.teams[0].citizens[0];
    command = new Command(citizen, "move", {
      position: new Position(0, 0)
    });
    actions = await game.executeTurn([command]);
  });

  test("returns actions", () => {
    expect(actions.length).toBe(1);
  });

  test("returns failure action", () => {
    const action = actions[0];
    expect(action.status).toBe("failure");
    expect(action.error).toBeTruthy();
    expect(action.mutation).toBeFalsy();
  });

  test("adds action to history", () => {
    const turnHistory = game.history.getActions(game.turn);
    expect(turnHistory.length).toBe(1);
  });
});
