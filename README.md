# Single tx swap

A trustless escrow service built on the Ergo blockchain.

## Motivation

In more liquid (not only) NFT ecosystems, a situation where two people want to
trade some assets is quite common. However, these people may not trust each
other. In such cases, a trustless escrow service is needed.

## Other services

There is a smart-contract based [TokenJay](https://tokenjay.app/escrow.html) P2P
escrow service. However, it has a few shortcomings:

- A person can only sell one token at a time (such as a single NFT or 100 SigUSD).
- A smart contract is used which means:
  - Users either need to trust the developer or understand the code.
  - Two transactions are needed to complete the swap.

## Our approach

We let anyone create a private trading session. The session owner can
send the link to this session to the other party they want to trade with.

The session owner is then presented with contents of both their and
other party's wallet contents. The owner can then select any set of
assets they want to trade. For example, they can send 100 SigUSD, 6 NFTs,
200 ErgoPad and 3000 COMET tokens and receive 10 ERG and other 3 NFTs in
exchange.

A multisig transaction is built and the session owner is asked to sign their
input boxes using the browser wallet. The partially signed transaction
is then sent to the other party and they are asked to verify the transaction
and sign their input boxes in case they are satisfied.

After both parties sign the transaction, it is submitted to the network.

Both parties were able to see the whole transaction in their wallet before
signing it. Also, the swap either happens as a whole (if the transaction
passes) or does not happen at all (if the transaction fails of if one of
the parties rejects to sign it).

A small service fee is a part of the multisig transaction too. This
fee is usually significantly lower than if one of the participants
used for example an NFT marketplace to list their NFTs and the other participants bought them.
This is because while NFT marketplaces charge a percentage of the sale price,
we only charge a small flat fee.

## Solutions on different blockchains

This solution is quite specific to UTxO blockchains. There are at least two
implementations of this method on Cardano called
[Trading Tent](https://www.tradingtent.io/) and
[Atomic Swap](https://atomic-swap.io/).
We haven't used any of these services in an attempt to make our implementation
of the UI uninfluenced..

# For developers

This is a monorepo consisting of two subfolders containing
backend and frontend code respectively.

## Backend
To setup a backend locally, you need to create a .env file in the backend folder
and fill it according to the .env-example file. You also need to have
a postgres database available. To run the backend locally, go to `bacnend`
folder and run:
```
npm install && npm run start-dev
```

## Frontend
This is a `next.js` app. To run the frontend locally, go to `frontend` folder
and run:
```
yarn && yarn dev
```