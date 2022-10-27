import { OutputBuilder, TransactionBuilder } from "@fleet-sdk/core";

export async function explorerRequest (endpoint: string) {
    const res = await fetch(`https://api.ergoplatform.com/api/v0${endpoint}`);
    return res.json();
}

export async function buildTxExample() {

    const address = "9hqD8UCTKwrfHN5doWCs5dkTWRw1dV1S9Afnj8RnJ1xj3rLPiAS";
    const inputsResponse = await explorerRequest(`/transactions/boxes/byAddress/unspent/${address}`);
    // const inputsResponse = await explorerRequest(`/info`);

    console.log(`Inputs json: ${JSON.stringify(inputsResponse)}`);

    // const unsignedTransaction = new TransactionBuilder(creationHeight)
    // .from(inputs)
    // .to(new OutputBuilder(BigInt(1000000), "9hg68j4rq5N11CpGgRNgK8LbykYTAnJ4f4xQ1y4sPRcwMRUS6tQ"))
    // .sendChangeTo("9hqD8UCTKwrfHN5doWCs5dkTWRw1dV1S9Afnj8RnJ1xj3rLPiAS")
    // .payMinFee()
    // .build();
}