import express from 'express';
import {config} from '@config';
import dbInit from '@db/init';

const app = express();

app.get('/', (req, res) => {
    dbInit();
    res.send("Ergo token swap API /");
});

app.listen(config.backendPort, () => {
    console.log(`server running on port ${config.backendPort}`);
});