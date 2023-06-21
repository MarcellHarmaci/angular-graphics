import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { ShapeType } from "src/app/_models/shape-type";

export class CarShape {
  stage: Konva.Stage;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  draggable: boolean;
  neighbors: CarShape[] = [];

  constructor(
    stage: Konva.Stage, x: number, y: number, width: number, height: number,
    index: number, draggable: boolean = true
  ) {
    this.stage = stage;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.draggable = draggable;
    this.index = index;
  }

  addNeighbor(neighbor?: CarShape) {
    if (neighbor != undefined) {
      this.neighbors.push(neighbor);
    }
  }

  draw(layer: Konva.Layer) {
    layer.add(this.shape());
  }

  shape(): Konva.Group {
    const group = new Konva.Group({
      draggable: this.draggable,
      type: ShapeType.CAR
    });
    const body = new Konva.Line({
      points: [
        this.x + this.width / 5,
        this.y,
        this.x + 4 * this.width / 5,
        this.y,
        this.x + this.width,
        this.y + this.height,
        this.x,
        this.y + this.height,
        this.x + this.width / 5,
        this.y
      ],
      closed: true,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 5,
      strokeScaleEnabled: true,
      perfectDrawEnabled: false,
      shadowForStrokeEnabled: false
    });
    const leftTyre = new Konva.Circle({
      x: this.x + this.width / 5,
      y: this.y + this.height,
      radius: this.height / 5,
      stroke: 'black',
      strokeWidth: 5,
    })
    const rightTyre = new Konva.Circle({
      x: this.x + 4 * this.width / 5,
      y: this.y + this.height,
      radius: this.height / 5,
      stroke: 'black',
      strokeWidth: 5,
    })
    group.add(body, leftTyre, rightTyre)

    const outerThis = this;
    const center = this.getCenter();
    this.neighbors.forEach(neighbor => {
      const nCenter = neighbor.getCenter();

      const perpendicular = {
        x: center.y - nCenter.y,
        y: (center.x - nCenter.x) * (-1)
      }

      const curvature: number = 0.3;
      const midCurve = {
        x: (center.x + nCenter.x) / 2 + perpendicular.x * curvature,
        y: (center.y + nCenter.y) / 2 + perpendicular.y * curvature
      }

      var curve = new Konva.Line({
        points: [
          center.x, center.y,
          midCurve.x, midCurve.y,
          nCenter.x, nCenter.y
        ],
        stroke: 'red',
        strokeWidth: 15,
        lineCap: 'round',
        lineJoin: 'round',
        tension: 1,
      });

      // curve.setDraggable(false);
      group.add(curve);
    });

    group.on('dragmove', function (event) {
      // console.log("x: " + this.x() + " | y: " + this.y());
      outerThis.broadcast();
    });

    return group;
  }

  getCenter(): Vector2d {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    }
  }

  broadcast() {
    this.neighbors.forEach(it => {
      it.receive(this.index, this.x, this.y);
    });
  }

  receive(index: number, x: number, y: number) {
    let changedNeighbor = this.neighbors.find(it => it.index == index);
    
    if (changedNeighbor) {
      changedNeighbor.x = x;
      changedNeighbor.y = y;
    }
  }

}
