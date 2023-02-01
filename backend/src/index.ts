import express from 'express';
import {config} from '@config';

const app = express();

app.get('/', (req, res) => {
    res.send("Ergo token swap API /");
});

app.listen(config.backendPort, () => {
    console.log(`server running on port ${config.backendPort}`);
});