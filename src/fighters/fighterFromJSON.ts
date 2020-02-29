import Game from "../Game";
import {
  FighterJSON,
  CavalryFighter,
  InfantryFighter,
  RangedFighter,
  Fighter
} from ".";

export default (game: Game, fighterJson: FighterJSON): Fighter => {
  if (!fighterJson) return undefined;
  if (fighterJson) {
    const fighterClass = {
      CavalryFighter,
      InfantryFighter,
      RangedFighter
    }[fighterJson.className];
    // TODO: Handle fighterJson type
    return fighterClass.fromJSON(game, fighterJson as any);
  }
};
