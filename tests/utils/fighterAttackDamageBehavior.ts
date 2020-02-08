import Game, { Fighters, FighterType } from "../../src/Game";
import Citizen from "../../src/Citizen";
import InfantryFighter from "../../src/InfantryFighter";
import CavalryFighter from "../../src/CavalryFighter";
import RangedFighter from "../../src/RangedFighter";
import Command from "../../src/Command";
import defaultGameProps from "./defaultGameProps";

export default function fighterAttackDamageBehavior(
  fighterType: FighterType,
  hardCounterType: FighterType
) {
  const fighterTypeToConstructor = {
    infantry: InfantryFighter,
    cavalry: CavalryFighter,
    ranged: RangedFighter
  };

  let game: Game,
    fighter: Fighters,
    target: Fighters | Citizen,
    command: Command;

  beforeEach(() => {
    game = Game.generate({ ...defaultGameProps, wallCount: 0 });
  });

  describe(`fighter is of type ${fighterType}`, () => {
    beforeEach(() => {
      target = game.getTeam("away").citizens[0];
      const fighterPosition = target.position.adjacents[0];
      fighter = new fighterTypeToConstructor[fighterType](game, {
        teamId: "home",
        position: fighterPosition
      });
      game.addFighter(fighter);
    });

    describe(`target is of type ${hardCounterType}`, () => {
      beforeEach(() => {
        const targetFighter = new fighterTypeToConstructor[hardCounterType](
          game,
          {
            teamId: "away",
            position: target.position
          }
        );
        game.killCitizen(target as Citizen);
        game.addFighter(targetFighter);
        target = targetFighter;
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

      test("target damage is to be more than the base damage", async () => {
        expect(fighter.attackDamage(target)).toBeGreaterThan(
          fighter.baseAttackDamage
        );
      });
    });

    describe("target is of type citizen", () => {
      beforeEach(() => {
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

      test("target damage is to be same as base damage", async () => {
        expect(fighter.attackDamage(target)).toEqual(fighter.baseAttackDamage);
      });
    });
  });
}
