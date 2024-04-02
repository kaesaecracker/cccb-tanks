import express from 'express';
import express_ws from 'express-ws';
import TankServer from './server/TankServer.js';

const app = express();
const port = process.env.PORT || 3000;

const tankServer = new TankServer();

app.use(express.static('client'));

express_ws(app).app.ws('/', client => tankServer.onConnection(client));

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
