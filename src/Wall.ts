import ObjectWithPosition, { Position } from "./ObjectWithPosition";

export type WallJSON = [number, number];

export default class Wall extends ObjectWithPosition {
  class: string = "Wall";

  toJSON() {
    return [this.x, this.y] as WallJSON;
  }

  static fromJSON(json: WallJSON) {
    return new Wall({
      position: new Position(json[0], json[1])
    });
  }
}
