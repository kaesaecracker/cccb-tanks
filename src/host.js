import express from "express";
import express_ws from "express-ws";
import {onConnection, start} from "./server/start.js";

const app = express()
const port = process.env.PORT || 3000

app.use(express.static('client'))

express_ws(app);
app.ws('/', onConnection)

app.listen(port, () => {
    start()
    console.log(`listening on port ${port}`)
})

