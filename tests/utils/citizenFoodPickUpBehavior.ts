import Game from "../../src/Game";
import Citizen from "../../src/Citizen";
import Food from "../../src/Food";
import Command from "../../src/Command";
import Action from "../../src/Action";
import defaultGameProps from "./defaultGameProps";
import isValidPosition from "../../src/utils/isValidPosition";

export default function citizenFoodPickUpBehavior(
  commandType: "move" | "pickUpFood",
  extraArgs: { autoPickUpFood?: boolean } = {}
) {
  describe(`with ${commandType} command`, () => {
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
        food = game.foodsList[0];
        const citizenPosition = food.position.adjacents.filter(pos => {
          return isValidPosition(game, pos);
        })[0];
        citizen = new Citizen(game, {
          teamId: "home",
          position: citizenPosition
        });
        game.addCitizen(citizen);
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
        expect(action.status).toBe("success");
        expect(action.error).toBeFalsy();
      });

      test("returns response with data changes", () => {
        const action = actions[0];
        expect(action.response.id).toBeTruthy();
      });

      test("picks-up food", () => {
        const action = actions[0];
        const newCitizen = game.lookup[action.response.id] as Citizen;
        expect(newCitizen.foodId).toBeTruthy();
      });
    });

    describe("citizen is not next to food", () => {
      let failureCitizen: Citizen;

      beforeEach(async () => {
        const citizenPosition = citizen.position.adjacents.filter(pos => {
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

      test("returns failure action", () => {
        const action = actions[0];
        expect(action.status).toBe("failure");
        expect(action.error).toBeTruthy();
        expect(action.response).toBeFalsy();
      });

      test("does not pick-up food", () => {
        const newCitizen = game.lookup[failureCitizen.id] as Citizen;
        expect(newCitizen.foodId).toBeFalsy();
      });
    });
  });
}
