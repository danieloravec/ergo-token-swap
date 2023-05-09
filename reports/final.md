# Final report

## Basic information
**Name:** Daniel Oravec

**Project name:** SingleTxSwap

**Repository link** [deployed branch]: [https://github.com/danieloravec/ergo-token-swap/tree/prod/web](https://github.com/danieloravec/ergo-token-swap/tree/prod/web)

**App accessible at:** [https://www.single-tx-swap.com/](https://www.single-tx-swap.com/)

## Local environment setup
- Clone the repository
### Backend
- Install postgres locally and create a user and a database (names are not important).
- Create a `/backend/.env` file and copy the contents of `/backend/.env-template` into it.
  Change all values appropriately (according to your database user / name / port... If
  you are not sure, any reasonable value should work).
- `cd backend` and run `npm install`. Then run `npm run start-dev`.
- If you need to use admin (at `/admin/home`), you need to set an `adminAuthSecret` cookie
  with a value of `ADMIN_SECRET` specified in `.env`.

### Frontend
- Create a `/web/.env` file and copy the contents of `/web/.env-template` into it.
  If needed, change any values, such as the backend URL.
- `cd web` and run `yarn`. Then run `yarn dev`.

## Features
### Implemented
- Navbar with wallet connect button. The wallet connection is persistent and the wallet can
  be disconnected as well.
- Theming (only _light_ and _dark_ themes are supported for now).
- Footer with the theme toggle button.
- Homepage with basic information and animated FAQ accordion section.
- Swap workflow for both parties (host, guest).
    - Host can create a trading room.visit
    - Guest can join the room.
    - The host is presented with a token selection screen,
      where they can select assets to swap.
    - The transaction can be signed by the host and also by the guest afterwards.
    - The session state should be persistent on page refreshes.
    - The transaction is submitted from the guest's browser.
- Profile section
    - User's socials and blockchain address are displayed.
        - Socials can be set by the user.
    - Tabs containing information about the profile
        - Owned NFTs
        - Owned fungible tokens
        - Swap history
        - Statistics (traded volume)
        - List of users that this user follows
- Swap history
    - Already mentioned in the previous section, contains all swaps performed by the user.
        - Only the transaction link and the other party's address are available, no swap summary.
- Messaging
    - Anyone can send a message to anyone else based on a blockchain addresses.
        - A button for sending a message to user X is available on X's profile page
    - Displaying both sent and received messages
        - Both views can be toggled using a toggle button
    - Message detail view
        - A reply button is available here as well
        - A message can be marked as unread here
    - Message can be deleted by both parties (but if 1 party deletes it, the other party
      will still see it)
- Using JWT for authentication is prepared
    - However, we need to sign secrets using the browser extension, but such
      data signing is not available there yet. Therefore, the backend accepts
      anything as a valid signature for now. But the infrastructure is ready.
- Statistics
  - Already mentioned in previous sections
  - Volume traded, accessible on the user's profile
  - Can be toggled between fungible tokens and NFTs
- Follows
  - A user can follow / unfollow another user from their profile page
  - A user can then view a list of users they follow, for easy access to friends profiles
- Holder search
  - If a user wants to find the owner of a specific token, they can find them based
    on the wanted token ID (which is publicly available).
- Admin section with asset verification
  - NFT collections are verified based on something called `minting address`
  - A standard for this verification exists
    - Some chain of transactions is tracked
    - We implement this standard
  - Collection names are displayed under NFT images now
    - If the NFT is not verified, an alerting string of `UNVERIFIED` is displayed

### Not implemented yet
Everything we planned should be implemented.

## Issues
- The app is not available on mobile devices (as no browser extension wallet is available there)
- Authentication is not available yet in the browser extension,
  therefore, anyone can edit anyone else's profile if they really try etc

## What I would change
- Consider a use of websockets for the trading session
- Start using some data format validation library on backend (currently the
  backend really needs a refactor of data validation).

## Conclusion
I'm overall satisfied with the current state. There were multiple challenging parts that
I managed to overcome and the product works as expected.
I learned a lot during the development so far.

I think that the most appealing part of the product is that it allows for trustless
interactions between people, without the need to trust the server as well.