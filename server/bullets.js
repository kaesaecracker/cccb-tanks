import {map, mapWidth, tileWidth} from "./settings.js";
import {killPlayer, players, playerScore} from "./players.js";

export let bullets = [];

export function tickBullets() {
    for (let i = 0; i < bullets.length; i++) {
        if (moveBullet(bullets[i])) {
            bullets.splice(i, 1)
            i--
        }
    }
}

function moveBullet(bullet) {
    const angle = bullet.dir / 16 * 2 * Math.PI;
    bullet.x += Math.sin(angle) * 3
    bullet.y -= Math.cos(angle) * 3

    return bulletHits(bullet);
}


function bulletHits(bullet) {
    const x = Math.round(bullet.x);
    const y = Math.round(bullet.y);
    const x0 = Math.floor(x / tileWidth);
    const y0 = Math.floor(y / tileWidth);
    if (map[x0 + mapWidth * y0] === '#') {
        return true;
    }

    // check against players
    for (let i = 0; i < players.length; i++) {
        const other = players[i];
        if (other === bullet.owner) continue

        const dx = x - other.x;
        const dy = y - other.y;

        if (dx >= 0 && dx < tileWidth &&
            dy >= 0 && dy < tileWidth) {
            killPlayer(other)
            playerScore(bullet.owner)
            return true
        }
    }

    return false
}
