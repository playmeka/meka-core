import Game, { Fighter, FighterType, CommandChildClass } from "../../src/Game";
import Citizen from "../../src/Citizen";
import InfantryFighter from "../../src/InfantryFighter";
import CavalryFighter from "../../src/CavalryFighter";
import RangedFighter from "../../src/RangedFighter";
import { AttackCommand } from "../../src/commands";
import defaultGameProps from "./defaultGameProps";

export default function fighterAttackDamageBehavior(
  fighterType: FighterType,
  hardCounterType: FighterType
) {
  let game: Game,
    fighter: Fighter,
    target: Fighter | Citizen,
    command: CommandChildClass;

  beforeEach(() => {
    game = Game.generate({ ...defaultGameProps, wallCount: 0 });
  });

  describe(`fighter is of type ${fighterType}`, () => {
    beforeEach(() => {
      target = game.getTeam("away").citizens[0];
      const fighterPosition = target.position.adjacents[0];
      const fighterClass = { CavalryFighter, RangedFighter, InfantryFighter }[
        fighterType
      ];
      fighter = new fighterClass(game, {
        teamId: "home",
        position: fighterPosition
      });
      game.addFighter(fighter);
    });

    describe(`target is of type ${hardCounterType}`, () => {
      beforeEach(() => {
        const fighterClass = { CavalryFighter, RangedFighter, InfantryFighter }[
          hardCounterType
        ];

        const targetFighter = new fighterClass(game, {
          teamId: "away",
          position: target.position
        });
        game.killCitizen(target as Citizen);
        game.addFighter(targetFighter);
        target = targetFighter;
        command = new AttackCommand({
          unit: fighter,
          args: {
            targetId: target.id
          }
        });
      });

      test("returns actions", async () => {
        const responses = await game.executeTurn([command]);
        const actions = responses.map(response => response.action);
        expect(actions.length).toBe(1);
      });

      test("returns success action with target as response", async () => {
        const responses = await game.executeTurn([command]);
        const actions = responses.map(response => response.action);
        const action = actions[0];
        expect(responses[0].status).toBe("success");
        expect(responses[0].error).toBeFalsy();
        expect(action.response).toEqual(target.toJSON());
      });

      test("target receives damage", async () => {
        const hp = target.hp;
        await game.executeTurn([command]);
        expect(target.hp).toBeLessThan(hp);
      });

      test("target damage is to be more than the base damage", async () => {
        expect(fighter.getAttackDamageFor(target)).toBeGreaterThan(
          fighter.baseAttackDamage
        );
      });
    });

    describe("target is of type citizen", () => {
      beforeEach(() => {
        command = new AttackCommand({
          unit: fighter,
          args: {
            targetId: target.id
          }
        });
      });

      test("returns actions", async () => {
        const responses = await game.executeTurn([command]);
        const actions = responses.map(response => response.action);
        expect(actions.length).toBe(1);
      });

      test("returns success action with target as response", async () => {
        const responses = await game.executeTurn([command]);
        const actions = responses.map(response => response.action);
        const action = actions[0];
        expect(responses[0].status).toBe("success");
        expect(responses[0].error).toBeFalsy();
        expect(action.response).toEqual(target.toJSON());
      });

      test("target receives damage", async () => {
        const hp = target.hp;
        await game.executeTurn([command]);
        expect(target.hp).toBeLessThan(hp);
      });

      test("target damage is to be same as base damage", async () => {
        expect(fighter.getAttackDamageFor(target)).toEqual(
          fighter.baseAttackDamage
        );
      });
    });
  });
}
