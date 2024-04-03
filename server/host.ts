import express from 'express';
import express_ws from 'express-ws';
import TankServer from './src/TankServer';
import ClientScreenManager from './src/ClientScreenManager';

const app = express();
const port = process.env.PORT || 3000;

const clientScreenManager = new ClientScreenManager();
const tankServer = new TankServer(clientScreenManager);

app.use(express.static('client'));

const ws_app = express_ws(app).app;
ws_app.ws('/', client => tankServer.onConnection(client));
ws_app.ws('/screen', client => clientScreenManager.addClient(client));

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
