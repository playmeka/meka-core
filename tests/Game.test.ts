import shuffle from "../src/utils/shuffle";
import isValidPosition from "../src/utils/isValidPosition";
import Game, { GameJSON, Fighters } from "../src/Game";
import Citizen from "../src/Citizen";
import Food from "../src/Food";
import InfantryFighter from "../src/InfantryFighter";
import RangedFighter from "../src/RangedFighter";
import HQ from "../src/HQ";
import Command from "../src/Command";
import Action from "../src/Action";
import fighterAttackDamageBehavior from "./utils/fighterAttackDamageBehavior";
import citizenFoodPickUpBehavior from "./utils/citizenFoodPickUpBehavior";
import defaultGameProps from "./utils/defaultGameProps";

describe("Game creation", () => {
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
});

describe("Sending invalid spawn command", () => {
  test("returns failure action", async () => {
    const game = Game.generate(defaultGameProps);
    // Note: this command is invalid because the team does not have enough food for a spawn
    const command = new Command(game.teams[0].hq, "spawnCitizen");
    const actions = await game.executeTurn([command]);
    expect(actions.length).toBe(1);
    const action = actions[0];
    expect(action.status).toBe("failure");
    expect(action.error).toBeTruthy();
  });
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

  test("increments game turn", () => {
    expect(game.turn).toBe(1);
  });

  test("adds action to history", () => {
    const turnHistory = game.history.getActions(game.turn);
    expect(turnHistory.length).toBe(1);
  });

  test("can be imported into game copy", () => {
    const newGame = Game.fromJSON(json);
    expect(newGame.turn).toBe(game.turn - 1);
    newGame.importTurn(game.turn, actions);
    const newCitizen = game.teams[0].citizens[0];
    expect(newGame.turn).toBe(game.turn);
    expect(newCitizen.position).toBe(citizen.position);
  });

  test("cannot be imported into generated game", () => {
    const generatedGame = Game.generate(defaultGameProps);
    try {
      generatedGame.importTurn(game.turn, actions);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});

describe("Sending invalid move command", () => {
  let game: Game, citizen: Citizen, command: Command, actions: Action[];

  beforeEach(async () => {
    game = Game.generate(defaultGameProps);
    citizen = game.teams[0].citizens[0];
    // Note: position is a valid position, just not adjacent to citizen
    const position = shuffle(
      game.positions.filter(pos => {
        return (
          isValidPosition(game, pos, citizen.teamId) &&
          !citizen.validMoves.includes(pos)
        );
      })
    )[0];
    command = new Command(citizen, "move", {
      position
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
  let game: Game, fighter: InfantryFighter, target: HQ, command: Command;

  beforeEach(() => {
    game = Game.generate(defaultGameProps);
    const citizen = game.getTeam("away").citizens[0];
    game.killCitizen(citizen); // Kill to avoid collisions with attack on HQ
    target = game.getTeam("away").hq;
    const attackPosition = target.position.adjacents[0];
    fighter = new InfantryFighter(game, {
      teamId: "home",
      position: attackPosition
    });
    game.addFighter(fighter);
    command = new Command(fighter, "attack", {
      position: target.position,
      target
    });
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

describe("Fighter attack damage behavior", () => {
  fighterAttackDamageBehavior("infantry", "cavalry");
  fighterAttackDamageBehavior("cavalry", "ranged");
  fighterAttackDamageBehavior("ranged", "infantry");
});

describe("Fighter range behavior", () => {
  let game: Game,
    fighter: Fighters,
    target: Fighters | Citizen,
    command: Command;

  beforeEach(() => {
    game = Game.generate({ ...defaultGameProps, wallCount: 0 });
  });

  describe(`fighter is of type ranged`, () => {
    beforeEach(() => {
      target = game.getTeam("away").citizens[0];
    });

    describe("target is within range", () => {
      beforeEach(() => {
        const fighterPosition = target.position
          .adjacentsWithinDistance(3)
          .filter(move => isValidPosition(game, move))[0];
        fighter = new RangedFighter(game, {
          teamId: "home",
          position: fighterPosition
        });
        game.addFighter(fighter);
        command = new Command(fighter, "attack", {
          position: target.position,
          target
        });
      });

      test("returns actions", async () => {
        const actions = await game.executeTurn([command]);
        expect(actions.length).toBe(1);
      });

      test("returns success action with target as response", async () => {
        const actions = await game.executeTurn([command]);
        const action = actions[0];
        expect(action.status).toBe("success");
        expect(action.error).toBeFalsy();
        expect(action.response).toEqual(target.toJSON());
      });

      test("target receives damage", async () => {
        const hp = target.hp;
        await game.executeTurn([command]);
        expect(target.hp).toBeLessThan(hp);
      });
    });

    describe("target is outside its range", () => {
      beforeEach(() => {
        const validPositions = target.position
          .adjacentsWithinDistance(3)
          .filter(move => isValidPosition(game, move));

        const broaderPositions = target.position
          .adjacentsWithinDistance(5)
          .filter(move => isValidPosition(game, move));

        var fighterPosition = broaderPositions.filter(function(obj) {
          return !validPositions.some(function(obj2) {
            return obj.x == obj2.x && obj.y == obj2.y;
          });
        })[0];

        fighter = new RangedFighter(game, {
          teamId: "home",
          position: fighterPosition
        });
        game.addFighter(fighter);
        command = new Command(fighter, "attack", {
          position: target.position,
          target
        });
      });

      test("returns actions", async () => {
        const actions = await game.executeTurn([command]);
        expect(actions.length).toBe(1);
      });

      test("returns failure action", async () => {
        const actions = await game.executeTurn([command]);
        const action = actions[0];
        expect(action.status).toBe("failure");
        expect(action.error).toBeTruthy();
        expect(action.response).toBeFalsy();
      });

      test("target does not take damage", async () => {
        const hp = target.hp;
        await game.executeTurn([command]);
        expect(target.hp).toEqual(hp);
      });
    });
  });
});

describe("Food pick-up behavior", () => {
  describe("move command with autoPickUpFood false", () => {
    let game: Game,
      citizen: Citizen,
      food: Food,
      command: Command,
      actions: Action[];

    describe("valid move", () => {
      beforeEach(async () => {
        game = Game.generate({
          ...defaultGameProps,
          foodCount: 1,
          wallCount: 0
        });
        food = shuffle(game.foodsList)[0];
        const citizenPosition = food.position.adjacents.filter(pos => {
          return isValidPosition(game, pos);
        })[0];
        citizen = new Citizen(game, {
          teamId: "home",
          position: citizenPosition
        });
        game.addCitizen(citizen);
        command = new Command(citizen, "move", {
          position: food.position,
          autoPickUpFood: false
        });
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
      });

      test("does not pick-up food", () => {
        const action = actions[0];
        const newCitizen = game.lookup[action.response.id] as Citizen;
        expect(newCitizen.foodId).toBeFalsy();
      });
    });
  });

  citizenFoodPickUpBehavior("move", { autoPickUpFood: true });
  citizenFoodPickUpBehavior("pickUpFood");
});

// describe("Food drop-off behavior with move");
// describe("Food drop-off behavior with pickUpFood");
