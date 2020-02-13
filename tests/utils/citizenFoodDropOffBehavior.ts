import Game from "../../src/Game";
import Citizen from "../../src/Citizen";
import Food from "../../src/Food";
import Command from "../../src/Command";
import Action from "../../src/Action";
import defaultGameProps from "./defaultGameProps";

function shouldDropOffFoodWithValidMove(
  commandType: "move" | "dropOffFood",
  extraArgs: { autoDropOffFood?: boolean } = {},
  dropOffAtHq: boolean
) {
  if (commandType === "dropOffFood") return true;
  else if (extraArgs.autoDropOffFood === true && dropOffAtHq) return true;
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
  } while (food.validDropOffs.length === 0);

  return game;
}

export default function citizenFoodPickUpBehavior(
  commandType: "move" | "dropOffFood",
  extraArgs: { autoDropOffFood?: boolean } = {}
) {
  describe(`with ${commandType} (autoDropOffFood: ${extraArgs.autoDropOffFood}) command`, () => {
    let game: Game,
      citizen: Citizen,
      food: Food,
      command: Command,
      actions: Action[],
      dropOffFood: boolean,
      dropOffAtHq: boolean;

    describe("valid move", () => {
      beforeEach(async () => {
        game = getValidGameWithFood();
        food = game.foodsList[0];

        const dropOffPosition = food.validDropOffs[0];
        citizen = new Citizen(game, {
          teamId: "home",
          position: food.position,
          foodId: food.id
        });
        game.addCitizen(citizen);
        command = new Command(citizen, commandType, {
          ...extraArgs,
          position: dropOffPosition
        });
        dropOffAtHq = !!game.hqs[dropOffPosition.key];

        dropOffFood = shouldDropOffFoodWithValidMove(
          commandType,
          extraArgs,
          dropOffAtHq
        );
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

      if (dropOffFood) {
        test(dropOffFood ? "drop-off food" : "does not drop-off food", () => {
          const newCitizen = game.lookup[citizen.id] as Citizen;
          if (dropOffFood) expect(newCitizen.foodId).toBeFalsy();
          else expect(newCitizen.foodId).toBeTruthy();
        });
      } else {
        test(dropOffFood ? "drop-off food" : "does not drop-off food", () => {
          const newCitizen = game.lookup[citizen.id] as Citizen;
          if (dropOffFood) expect(newCitizen.foodId).toBeFalsy();
          else expect(newCitizen.foodId).toBeTruthy();
        });
      }
    });
  });
}
