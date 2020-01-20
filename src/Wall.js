import ObjectWithPosition, {
  Position,
  randomPosition
} from "./ObjectWithPosition";

export default class Wall extends ObjectWithPosition {
  class = "Wall";

  toJSON() {
    return [this.x, this.y];
  }

  static fromJSON(json) {
    return new Wall({
      position: { x: json[0], y: json[1] }
    });
  }
}
