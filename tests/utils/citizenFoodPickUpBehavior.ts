import Game from "../../src/Game";
import Citizen from "../../src/Citizen";
import Food from "../../src/Food";
import Command from "../../src/Command";
import Action from "../../src/Action";
import defaultGameProps from "./defaultGameProps";
import isValidPosition from "../../src/utils/isValidPosition";

function shouldPickUpFoodWithValidMove(
  commandType: "move" | "pickUpFood",
  extraArgs: { autoPickUpFood?: boolean } = {}
) {
  if (commandType === "pickUpFood") return true;
  else if (extraArgs.autoPickUpFood === true) return true;
  return false;
}

function getValidGameWithFood() {
  let game, food;
  do {
    game = Game.generate({
      ...defaultGameProps,
      foodCount: 1,
      wallCount: 0
    });
    food = game.foodsList[0];
  } while (food.validDropOffs.length <= 1);

  return game;
}

export default function citizenFoodPickUpBehavior(
  commandType: "move" | "pickUpFood",
  extraArgs: { autoPickUpFood?: boolean } = {}
) {
  describe(`with ${commandType} (autoPickUpFood: ${extraArgs.autoPickUpFood}) command`, () => {
    let game: Game,
      citizen: Citizen,
      food: Food,
      command: Command,
      actions: Action[],
      pickUpFood: boolean;

    describe("valid move", () => {
      beforeEach(async () => {
        game = getValidGameWithFood();
        food = game.foodsList[0];
        const citizenPosition = food.position.adjacents.filter(pos => {
          return isValidPosition(game, pos);
        })[0];

        citizen = new Citizen(game, {
          teamId: "home",
          position: citizenPosition
        });
        game.addCitizen(citizen);
        pickUpFood = shouldPickUpFoodWithValidMove(commandType, extraArgs);
        command = new Command(citizen, commandType, {
          ...extraArgs,
          position: food.position
        });
        actions = await game.executeTurn([command]);
      });

      test("returns actions", () => {
        expect(actions.length).toBe(1);
      });

      test("returns success action", () => {
        const action = actions[0];
        expect(action.error).toBeFalsy();
        expect(action.status).toBe("success");
      });

      test("returns response with data changes", () => {
        const action = actions[0];
        expect(action.response.id).toBeTruthy();
      });

      test(pickUpFood ? "picks-up food" : "does not pick-up food", () => {
        const action = actions[0];
        const newCitizen = game.lookup[action.response.id] as Citizen;
        if (pickUpFood) expect(newCitizen.foodId).toBeTruthy();
        else expect(newCitizen.foodId).toBeFalsy();
      });
    });

    describe("citizen is not next to food", () => {
      let failureCitizen: Citizen;

      beforeEach(async () => {
        const startingPosition = citizen.position;
        game.killCitizen(citizen);
        const citizenPosition = startingPosition.adjacents.filter(pos => {
          return isValidPosition(game, pos);
        })[0];
        // This citizen is now two-off food
        failureCitizen = new Citizen(game, {
          teamId: "home",
          position: citizenPosition
        });
        game.addCitizen(failureCitizen);
        command = new Command(failureCitizen, commandType, {
          ...extraArgs,
          position: food.position
        });
        actions = await game.executeTurn([command]);
      });

      if (commandType === "move") {
        test("returns failure action", () => {
          const action = actions[0];
          expect(action.status).toBe("success");
        });
      } else {
        test("returns failure action", () => {
          const action = actions[0];
          expect(action.status).toBe("failure");
          expect(action.error).toBeTruthy();
          expect(action.response).toBeFalsy();
        });
      }

      test("does not pick-up food", () => {
        const newCitizen = game.lookup[failureCitizen.id] as Citizen;
        expect(newCitizen.foodId).toBeFalsy();
      });
    });
  });
}
