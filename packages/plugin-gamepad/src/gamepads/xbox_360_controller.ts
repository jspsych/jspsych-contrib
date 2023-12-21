import { GamepadModel } from "../gamepad-model";

export function xbox_360_controller(gamepad: Gamepad, parent: HTMLElement): GamepadModel {
  let model: GamepadModel = new GamepadModel(gamepad, parent, 441);

  model.draw_outline = (context: CanvasRenderingContext2D) => {
    context.save();
    context.lineWidth = 3;

    let outline_left: Path2D = new Path2D(
      "M220.5 323.5L150 323.5C105 323.5 81.5 407.5 49.5 407.5C17.5 407.5 4 392.9 4 346.5C4 300.1 43.5 194.5 55 166.5C66.5 138.5 95.5 121 128 121L220.5 121"
    );
    let outline_right: Path2D = new Path2D(
      "M220.5 323.5L291 323.5C336 323.5 359.5 407.5 391.5 407.5C423.5 407.5 437 392.9 437 346.5C437 300.1 397.5 194.5 386 166.5C374.5 138.5 345.5 121 313 121L220.5 121"
    );
    context.stroke(outline_left);
    context.stroke(outline_right);

    let ls_outline: Path2D = new Path2D();
    ls_outline.arc(113, 189, 37.5, 0, Math.PI * 2);
    context.stroke(ls_outline);

    let rs_outline: Path2D = new Path2D();
    rs_outline.arc(278, 267, 37.5, 0, Math.PI * 2);
    context.stroke(rs_outline);

    let d_outline: Path2D = new Path2D();
    d_outline.arc(163, 267, 37.5, 0, Math.PI * 2);
    context.stroke(d_outline);

    context.restore();
  };

  model.draw_component({ x: 113, y: 189, radius: 30 }, 0, 10); // left stick
  model.draw_component({ x: 278, y: 267, radius: 30 }, 1, 11); // right stick

  model.draw_component({ x: 328, y: 207, radius: 8 }, -1, 0); // A
  model.draw_component({ x: 346, y: 189, radius: 8 }, -1, 1); // B
  model.draw_component({ x: 310, y: 189, radius: 8 }, -1, 2); // X
  model.draw_component({ x: 328, y: 171, radius: 8 }, -1, 3); // Y

  model.draw_component(
    new Path2D(
      "M111.5 90.5L152.5 90.5C160 90.5 160 103.5 152.5 103.5L111.5 103.5C104 103.5 104 90.5 111.5 90.5"
    ),
    -1,
    4
  ); // LB
  model.draw_component(
    new Path2D(
      "M329.5 90.5L288.5 90.5C281 90.5 281 103.5 288.5 103.5L329.5 103.5C337 103.5 337 90.5 329.5 90.5"
    ),
    -1,
    5
  ); // RB

  model.draw_component(
    new Path2D(
      "M152.5 66C152.5 70 149 73.5 145 73.5H132C128 73.5 124.5 70 124.5 66V45.5C124.5 38 131 31.5 138.5 31.5C146 31.5 152.5 38 152.5 45.5V66Z"
    ),
    -1,
    6
  ); // LT
  model.draw_component(
    new Path2D(
      "M288.5 66C289.5 70 292 73.5 296 73.5H309C313 73.5 316.5 70 316.5 66V45.5C316.5 38 310 31.5 302.5 31.5C295 31.5 288.5 38 288.5 45.5V66Z"
    ),
    -1,
    7
  ); // RT

  model.draw_component({ x: 185, y: 191, radius: 8 }, -1, 8); // Left meta
  model.draw_component({ x: 259, y: 191, radius: 8 }, -1, 9); // Right meta

  model.draw_component({ x: 163, y: 249, radius: 8 }, -1, 12); // DUp
  model.draw_component({ x: 163, y: 285, radius: 8 }, -1, 13); // DDown
  model.draw_component({ x: 145, y: 267, radius: 8 }, -1, 14); // DLeft
  model.draw_component({ x: 181, y: 267, radius: 8 }, -1, 15); // DRight

  return model;
}
