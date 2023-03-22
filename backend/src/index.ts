import express from 'express';
import {config} from '@config';
import cors from 'cors';
import tradingSessionRouter from "@api/trading_session_router";
import txRouter from "@api/tx_router";
import userRouter from "@api/user_router";

const app = express();

app.use(express.json());
app.use(cors());

app.use('/session', tradingSessionRouter);
app.use('/tx', txRouter);
app.use('/user', userRouter);

app.get('/', (req, res) => {
    res.send("Ergo token swap API /");
});

app.listen(config.backendPort, () => {
    console.log(`server running on port ${config.backendPort}`);
});