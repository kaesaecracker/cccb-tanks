# tanks
A tank game for the CCCB Airport Display.

![Tank Game](/picture.jpg?raw=true)

By Felix and [Stephen](https://github.com/increpare).

### Running the server

Build an image using podman: `make container-image`

Run it locally (you will need node+npm):
1. `make restore` to download dependencies
2. `make start` to start the server

### Ideas
- [ ] Make the tank slower when you shoot (Denis)
- [ ] Stable Sort the Scoreboard so that the first person getting the high score stays on top until someone scores higher
- [x] Only allow firing while not moving (vinzenz)
- [x] limited fire rate (vinzenz)
- [ ] press R to respawn (vinzenz)
- [ ] external display emulator, the one written for Java 1.6 seems to be lost (vinzenz)
- [ ] destructible walls (shoot each led individually)
- [ ] collectible power ups
- [ ] dual screen gameplay (player-specific info on own screen)
