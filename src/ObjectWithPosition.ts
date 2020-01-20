const uuidv4 = require("uuid/v4");

export const randomPosition = (width: number, height: number) => {
  return new Position(
    Math.floor(Math.random() * width),
    Math.floor(Math.random() * height)
  );
};

export class Position {
  x: number;
  y: number;

  constructor(x: number, y: number) {
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
  position: Position;
  id: string;
  width: number;
  height: number;

  constructor(props: {
    id?: string;
    width?: number;
    height?: number;
    position: Position;
  }) {
    this.position = props.position;
    this.width = props.width || 1;
    this.height = props.height || 1;
    this.id = props.id || uuidv4();
  }

  get key() {
    return this.position.key;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get covering() {
    const positions = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        positions.push(new Position(this.x + x, this.y + y));
      }
    }
    return positions;
  }
}
