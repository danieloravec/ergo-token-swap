# Beta report

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
Change all values appropriately (according to your database user / name / port...).
- `cd backend` and run `npm install`. Then run `npm run start-dev`.

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
- Homepage with basic information and FAQ accordion section.
- Swap workflow for both parties (host, guest).
  - Host can create a trading room.
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
- Swap history
  - Already mentioned in the previous section, contains all swaps performed by the user.
    - Only the transaction link and the other party's address are available, no swap summary.
- Messaging
  - Anyone can send a message to anyone else based on blockchain addresses.
    - A button for sending a message to user X is available on X's profile page
  - Displaying both sent and received messages
    - Both views can be toggled using a toggle button
  - Message detail view
    - A reply button is available here as well
- Using JWT for authentication is prepared
    - However, we need to sign secrets using the browser extension, but such
  data signing is not available there yet. Therefore, the backend accepts
  anything as a valid signature for now. But the infrastructure is mostly ready.
  
### Not implemented yet
- Delete message / mark as unread.
- Statistics
  - Swap history is implemented already, but we are missing asset volume per user,
  number of trading sessions the user participated in etc.
- Searching profile by asset id.
- Marking assets as verified.


## Plans for next weeks
- Implementing the missing features.
  - Delete message / mark as unread (before 30.4.2023).
  - Statistics (before 30.4.2023).
  - Searching profile by asset id (before 9.5.2023).
  - Marking assets as verified (before 9.5.2023).
  - Fixing issues that will be found while testing.

## Issues
- Too many requests are made.
- The app is not available on mobile devices (as no browser extension wallet is available there).
- Authentication is not available yet, therefore, anyone can edit anyone else's profile etc.