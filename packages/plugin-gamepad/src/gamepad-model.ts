import { xbox_360_controller } from "./gamepads/xbox_360_controller";

export class GamepadModel {
  constructor(private gamepad: Gamepad, parent: HTMLElement, private size: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.canvas.style.width = "100%";

    parent.appendChild(this.canvas);

    this.context = this.canvas.getContext("2d", { willReadFrequently: true });
  }

  private canvas: HTMLCanvasElement;

  private context: CanvasRenderingContext2D;

  private draw_call_list: Array<Function> = [];

  public draw_outline: (context: CanvasRenderingContext2D) => void = (
    _context: CanvasRenderingContext2D
  ) => {};

  // set button_id to -1 if the current component cannot be pressed
  public draw_component(component: ComponentPath, axes_id: number, button_id: number): void {
    if (component instanceof Path2D) {
      this.draw_call_list.push(() => {
        this.context.save();
        this.context.fillStyle = `rgba(0, 0, 0, ${this.gamepad.buttons[button_id]?.value})`;
        this.context.lineWidth = 3;
        this.context.stroke(component);
        this.context.fill(component);
        this.context.restore();
      });
    } else {
      this.draw_call_list.push(() => {
        let axes_1: number = axes_id === -1 ? 0 : this.gamepad.axes[axes_id * 2];
        let axes_2: number = axes_id === -1 ? 0 : this.gamepad.axes[axes_id * 2 + 1];

        let path: Path2D = new Path2D();
        path.arc(
          component.x + (axes_1 * component.radius) / 2,
          component.y + (axes_2 * component.radius) / 2,
          component.radius,
          0,
          Math.PI * 2
        );

        this.context.stroke(path);

        this.context.save();
        this.context.fillStyle = `rgba(0, 0, 0, ${this.gamepad.buttons[button_id]?.value})`;
        this.context.lineWidth = 3;
        this.context.stroke(path);
        this.context.fill(path);
        this.context.restore();
      });
    }
  }

  public update(gamepad: Gamepad | null): void {
    if (gamepad !== null) {
      this.gamepad = gamepad;
    }
    this.context.clearRect(0, 0, this.size, this.size);
    this.draw_outline(this.context);
    for (let func of this.draw_call_list) {
      func();
    }
  }
}

type ComponentPath = Path2D | { x: number; y: number; radius: number };

type GamepadTemplate = (gamepad: Gamepad, parent: HTMLElement) => GamepadModel;

export let GamepadModels: { [prop: string]: GamepadTemplate } = {
  "Xbox 360 Controller (XInput STANDARD GAMEPAD)": xbox_360_controller,
};
