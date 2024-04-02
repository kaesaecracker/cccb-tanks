export const displaySettings = {
    ip: '172.23.42.29',
    port: 2342,
    tileWidth: 8,
    tileSize: 8,
};

export const bulletsSettings = {
    bulletSpeed: 8
};

export const playerSettings = {
    tankSpeed: 1.5,
    turnSpeed: 0.5,
    respawnDelay: 3,
    shootDelay: 0.3,
};

const mapWidth = 44;
const map = '\
############################################\
#...................##.....................#\
#...................##.....................#\
#.....####......................####.......#\
#..........................................#\
#............###...........###.............#\
#............#...............#.............#\
#...##.......#...............#......##.....#\
#....#..............................#......#\
#....#..##......................##..#......#\
#....#..##......................##..#......#\
#....#..............................#......#\
#...##.......#...............#......##.....#\
#............#...............#.............#\
#............###...........###.............#\
#..........................................#\
#.....####......................####.......#\
#...................##.....................#\
#...................##.....................#\
############################################\
';

export const mapSettings = {
    map,
    mapWidth,
    mapHeight: map.length / mapWidth,
};