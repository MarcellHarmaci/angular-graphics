import { AfterViewInit, Component, ViewChild } from '@angular/core';
import Konva from "konva";
import Shape = Konva.Shape;
import Group = Konva.Group;
import { MatMenuTrigger } from "@angular/material/menu";
import { ShapeType } from "src/app/_models/shape-type";
import { CarShape } from "src/app/graphics/shapes/car";
import { ParkingShape } from "src/app/graphics/shapes/parking";

@Component({
  selector: 'app-graphics',
  templateUrl: './graphics.component.html',
  styleUrls: ['./graphics.component.less']
})
export class GraphicsComponent implements AfterViewInit {
  @ViewChild('contextMenuTrigger') contextMenuTriggerEl?: MatMenuTrigger;
  clickedShape?: Shape | Group;
  menuPositionLeft?: number;
  menuPositionTop?: number;
  selectedLayer?: Konva.Layer;
  selectedShape: ShapeType = ShapeType.CAR;
  stage?: Konva.Stage;
  shapes: Shape[] = [];

  carCnt: number = 1;
  lastCar?: CarShape = undefined;

  ShapeType = ShapeType;

  constructor() { }

  ngAfterViewInit() {
    this.initState(() => {
      this.addEventListeners();
    });
  }

  addEventListeners() {
    if (this.stage) {
      this.stage.on('click', (event) => {
        if (event.target instanceof Shape) {
          if (event.target.parent instanceof Group) {
            this.clickedShape = event.target.parent;
          } else {
            this.clickedShape = event.target;
          }
          this.menuPositionLeft = event.target.getClientRect().x;
          this.menuPositionTop = event.target.getClientRect().y;
          this.contextMenuTriggerEl?.openMenu();
        } else {
          if (this.stage) {
            const pointerPosition = this.stage.getRelativePointerPosition();
            if (pointerPosition) {
              this.drawShape(this.selectedShape, pointerPosition.x, pointerPosition.y);
            }
          }
        }
      });

      this.stage.on('dragmove', function (event) {
        // console.log(event);
      });
    }
  }

  deleteShape() {
    this.clickedShape?.destroy();
  }

  drawShape(shapeType: ShapeType, x: number, y: number) {
    if (this.stage && this.selectedLayer) {
      let shape;
      switch (shapeType) {
        case ShapeType.CAR:
          shape = new CarShape(this.stage, x, y, 50, 25, this.carCnt);

          // add connections
          shape.addNeighbor(this.lastCar);
          this.lastCar?.addNeighbor(shape);

          // update state
          this.carCnt += 1;
          this.lastCar = shape;

          break;
        case ShapeType.PARKING:
          if (this.lastCar) {
            this.lastCar.x += 50;
            this.lastCar.y += 50;
          }
          shape = new ParkingShape(this.stage, x, y, 50, 50);
          break;
      }

      if (shape) {
        shape.draw(this.selectedLayer);
      }
    }
  }

  initState(callback: () => any) {
    setTimeout(() => {
      this.stage = new Konva.Stage({
        container: 'container',
        width: window.innerWidth,
        height: window.innerHeight,
      });

      if (this.stage) {
        const layer = new Konva.Layer();
        this.stage.add(layer);

        this.selectedLayer = this.stage.getLayers()[0];
      }

      callback();
    }, 0);
  }

  shapeToBottom() {
    this.clickedShape?.moveToBottom();
  }

  shapeToTop() {
    this.clickedShape?.moveToTop();
  }

  newConnection() {
    
  }

}
