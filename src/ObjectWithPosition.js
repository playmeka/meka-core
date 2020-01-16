import { observable, computed } from "mobx";
import uuid from "uuid/v1";

export const randomPosition = (width, height) => {
  return new Position(
    Math.floor(Math.random() * width),
    Math.floor(Math.random() * height)
  );
};

export class Position {
  @observable x;
  @observable y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  get key() {
    return [this.x, this.y].toString();
  }

  get adjacents() {
    return [
      new Position(this.x + 1, this.y),
      new Position(this.x - 1, this.y),
      new Position(this.x, this.y + 1),
      new Position(this.x, this.y - 1)
    ];
  }

  toJSON() {
    return { x: this.x, y: this.y };
  }
}

export default class ObjectWithPosition {
  class = "ObjectWithPosition";

  constructor(props = {}) {
    this.position = new Position(
      (props.position || {}).x || props.x || 0,
      (props.position || {}).y || props.y || 0
    );
    this.width = props.width || 1;
    this.height = props.height || 1;
    this.id = props.id || `${uuid()}@${this.class}`;
  }

  // Computed values
  @computed get key() {
    return this.position.key;
  }

  @computed get x() {
    return this.position.x;
  }

  @computed get y() {
    return this.position.y;
  }

  @computed get covering() {
    const positions = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        positions.push(new Position(this.x + x, this.y + y));
      }
    }
    return positions;
  }

  toJSON() {
    const { id, width, height } = this;
    return {
      id,
      width,
      height,
      position: this.position.toJSON()
    };
  }
}
