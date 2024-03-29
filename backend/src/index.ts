import express from 'express';
import {config} from '@config';
import cors from 'cors';
import tradingSessionRouter from "@api/trading_session_router";
import txRouter from "@api/tx_router";
import userRouter from "@api/user_router";
import messageRouter from "@api/message_router";
import holderRouter from "@api/holder_router";
import collectionRouter from "@api/collection_router";

const app = express();

app.use(express.json());
app.use(cors());

app.use('/session', tradingSessionRouter);
app.use('/tx', txRouter);
app.use('/user', userRouter);
app.use('/message', messageRouter);
app.use('/holder', holderRouter);
app.use('/collection', collectionRouter);

app.get('/', (req, res) => {
    res.send("Ergo token swap API /");
});

// app.listen(config.backendPort, () => {
//     console.log(`server running on port ${config.backendPort}`);
// });
// TODO the port needs to be hardcoded here, otherwise https redirection does not work
app.listen(8081, () => {
    console.log(`server running on port 8081`);
});
