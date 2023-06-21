import Konva from "konva";
import { Group } from "konva/lib/Group";
import { Shape } from "konva/lib/Shape";
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

    this.drawLine(group, { x: 0, y: 0 });

    // TODO eltüntetni a régi vonalakat vagy még jobb lenne hatni a kirajzoldakra
    const outerThis = this;
    group.on('dragmove', function (event) {
      console.log(event);
      let diff = { x: event.evt.movementX, y: event.evt.movementY };
      // outerThis.drawLine(group, diff);
    });

    return group;
  }

  drawLine(group: Group, diff: Vector2d) {
    let center = this.getCenter();
    this.neighbors.forEach(neighbor => {
      neighbor.x -= diff.x;
      neighbor.y -= diff.y;
      let nCenter = neighbor.getCenter();

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
  }

  getCenter(): Vector2d {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    }
  }

}
