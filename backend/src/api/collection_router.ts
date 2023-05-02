import Router from 'express'
import {Op} from "sequelize";
import Collection from "@db/models/collection";
import {ensureAddressValid} from "@utils";

const collectionRouter = Router();

collectionRouter.get('/byMintingAddresses', async (req, res) => {
  try {
    const mintingAddresses = JSON.parse(req.query?.mintingAddresses as string);
    if (!mintingAddresses) {
      res.status(400);
      res.send("Invalid mintingAddresses");
      return;
    }

    for (const mintingAddress of mintingAddresses) {
      if (!ensureAddressValid(req, res, mintingAddress)) {
        return;
      }
    }

    const result: {
      [mintingAddress: string]: {
        name: string;
        description: string;
      }
    } = {};

    for (const mintingAddress of mintingAddresses) {
      const collection: Collection | undefined = await Collection.findOne({
        where: {
          mintingAddresses: {
            [Op.contains]: [mintingAddress]
          }
        },
        raw: true
      });
      if (collection) {
        result[mintingAddress] = {
          name: collection.name,
          description: collection.description,
        }
      }
    }
    res.send({collectionsByMintAddress: result});
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send("Server-side error while getting collections");
  }
});

export default collectionRouter;