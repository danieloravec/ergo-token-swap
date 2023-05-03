import Router from 'express'
import {Op} from "sequelize";
import Collection from "@db/models/collection";
import {ensureAddressValid} from "@utils";
import * as utils from "@utils";
import * as types from "@types";
import {ensureAdminAuth} from "../utils/adminUtils";

const collectionRouter = Router();

collectionRouter.get('/', async (req, res) => {
  try {
    const collections = await Collection.findAll({
      raw: true
    });
    res.send({collections});
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send("Server-side error while getting collections");
  }
});

collectionRouter.post(`/`, async (req, res) => {
  try {
    if (!ensureAdminAuth(req, res)) {
      return;
    }
    const bodyIsValid = await utils.validateObject(req.body, types.CollectionCreateBodySchema);
    if (!bodyIsValid) {
      res.status(400);
      res.send('Invalid body');
      return;
    }
    const body: { name: string, description: string, mintingAddresses: string[] } = req.body;

    for (const mintingAddress of body.mintingAddresses) {
      if (!ensureAddressValid(req, res, mintingAddress)) {
        return;
      }
    }

    const existingCollectionName = await Collection.findOne({
      where: {
        name: body.name
      },
      raw: true
    });
    if (existingCollectionName) {
      res.status(400);
      res.send({message: "Collection with this name already exists"});
      return;
    }

    for (const mintingAddress of body.mintingAddresses) {
      const existingCollection = await Collection.findOne({
        where: {
          mintingAddresses: {
            [Op.contains]: [mintingAddress]
          }
        },
        raw: true
      });
      if (existingCollection) {
        res.status(400);
        res.send({message: "Collection with this minting address already exists"});
        return;
      }
    }
    const collection = await Collection.create({
      name: body.name,
      description: body.description,
      mintingAddresses: body.mintingAddresses,
    });

    res.send(collection);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send(`Server-side error while adding a verified collection: ${JSON.stringify(err)}`);
  }
});

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