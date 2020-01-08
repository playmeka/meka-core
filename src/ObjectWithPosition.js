import { observable, computed } from "mobx";

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
}

export default class ObjectWithPosition {
  constructor(props = {}) {
    this.position = new Position(props.x || 0, props.y || 0);
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
}
