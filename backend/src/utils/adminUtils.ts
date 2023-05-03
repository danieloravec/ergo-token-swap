import {Request, Response} from "express";
import {config} from "@config";

export const ensureAdminAuth = (req: Request, res: Response) => {
  if (req.body?.adminAuthSecret !== config.adminSecret) {
    res.status(403);
    res.send("Forbidden");
    return false;
  }
  return true;
}