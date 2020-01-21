import ObjectWithPosition, {
  Position,
  randomPosition
} from "./ObjectWithPosition";

export default class Wall extends ObjectWithPosition {
  class: string = "Wall";

  toJSON() {
    return [this.x, this.y];
  }

  static fromJSON(json: any) {
    return new Wall({
      position: new Position(json[0], json[1])
    });
  }
}
