import { Request, Response } from "express";
import { DocumentStores } from "../stores";

export class DDCApiService {
  private docStores: DocumentStores;

  constructor(docStores: DocumentStores) {
    this.docStores = docStores;
  }

  public async setDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!("schemaAddress" in req.body) || !("jwt" in req.body))
        res.status(400).end();
      else {
        await this.docStores.setDocument(req.body["schemaAddress"],
          req.body["jwt"]);

        res.status(200).end();
      }

    } catch (err) {
      res.status(500).send({ err: err.toString() });
    }
  }

  public async getDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!("schemaAddress" in req.params) || !("id" in req.params))
        res.status(400).end();
      else {
        let document =
          await this.docStores.getDocument(req.params["schemaAddress"],
            req.params["id"]);

        res.status(200).send({document: document});
      }
    } catch (err) {
      res.status(404).send({ err: err.toString() });
    }
  }

  public async getDocumentStores(req: Request, res: Response): Promise<void> {
    let docStores = await this.docStores.getDocumentStores();
    res.send(docStores);
  }
}
