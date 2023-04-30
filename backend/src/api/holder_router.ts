import Router from 'express'
import {explorerRequest} from "@utils";
import User from "@db/models/user";

const holderRouter = Router();

holderRouter.get('/', async (req, res) => {
  try {
    if (typeof req.query?.tokenId !== "string") {
      res.status(400);
      res.send("Invalid tokenId");
      return;
    }

    const boxesByTokenIdRes = await explorerRequest(`/boxes/unspent/byTokenId/${req.query!.tokenId}`, 1);

    const holderAddresses = boxesByTokenIdRes.items.map((box: { address: string, [key: string]: any }) => box.address);

    const holdersWithProfile = await User.findAll({
      where: {
        address: holderAddresses
      },
      order: [['email', 'DESC'], ['discord', 'DESC'], ['twitter', 'DESC']],
      raw: true
    });

    // TODO inefficient, but probably fine for now
    const holdersWithoutProfile = holderAddresses.filter((address: string) => {
      return !holdersWithProfile.find((holder: User) => holder.address === address);
    });

    const mergedHolders = holdersWithProfile.concat(holdersWithoutProfile.map((address: string) => {
      return {
        address,
      } as User;
    }));
    res.send(mergedHolders);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send("Server-side error while getting holders");
  }
});

export default holderRouter;