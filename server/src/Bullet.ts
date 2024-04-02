import Player from "./Player";

export type Bullet = {
    readonly owner: Player;
    readonly dir: number;
    x: number;
    y: number;
}
