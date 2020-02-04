import Game, { GameJSON } from "../src/Game";
import Citizen from "../src/Citizen";
import Fighter from "../src/Fighter";
import HQ from "../src/HQ";
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
  let game: Game,
    json: GameJSON,
    citizen: Citizen,
    command: Command,
    actions: Action[];

  beforeEach(async () => {
    game = Game.generate(defaultGameProps);
    json = game.toJSON();
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
  test("returns response with data changes", () => {
    const action = actions[0];
    expect(action.response.id).toBeTruthy();
    // TODO: check class is CitizenJSON
  });

  test("adds action to history", () => {
    const turnHistory = game.history.getActions(game.turn);
    expect(turnHistory.length).toBe(1);
  });

  test("can be imported into new game", () => {
    const newGame = Game.fromJSON(json);
    newGame.importTurn(game.turn, actions);
    const newCitizen = game.teams[0].citizens[0];
    expect(newGame.turn).toBe(game.turn);
    expect(newCitizen.position).toBe(citizen.position);
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
    expect(action.response).toBeFalsy();
  });

  test("adds action to history", () => {
    const turnHistory = game.history.getActions(game.turn);
    expect(turnHistory.length).toBe(1);
  });
});

describe("Sending valid attack command", () => {
  let game: Game, fighter: Fighter, target: HQ, command: Command;

  beforeEach(() => {
    game = Game.generate({
      ...defaultGameProps,
      homeId: "home",
      awayId: "away"
    });
    const citizen = game.getTeam("away").citizens[0];
    game.killCitizen(citizen); // Kill to avoid collisions with attack on HQ
    target = game.getTeam("away").hq;
    const attackPosition = target.position.adjacents[0];
    fighter = new Fighter(game, { teamId: "home", position: attackPosition });
    game.addFighter(fighter);
    command = new Command(fighter, "attack", { position: target.position });
  });

  test("returns actions", async () => {
    const actions = await game.executeTurn([command]);
    expect(actions.length).toBe(1);
  });

  test("returns success action with target (HQ) as response", async () => {
    const actions = await game.executeTurn([command]);
    const action = actions[0];
    expect(action.status).toBe("success");
    expect(action.error).toBeFalsy();
    expect(action.response).toEqual(target.toJSON());
  });

  test("target takes damage", async () => {
    const hp = target.hp;
    await game.executeTurn([command]);
    expect(target.hp).toBeLessThan(hp);
  });
});
