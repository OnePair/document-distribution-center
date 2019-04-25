import { Request, Response } from "express";
import { AuthID, AuthIDDriver } from "authid-core-ts";
import { EthAuthIDDriver } from "authid-eth-driver";
import { JsonRpcProvider } from "ethers/providers";
import { Config } from "../../config";
import { DocumentStores } from "../stores";

import path from "path";

const PAGES_DIR = path.join(__dirname, "../views/ejs/admin");

const ETH = "ETH";
const ETHB_DID = "ethb";

/*
* TODO: check this dashboard out
*/
export class AdminService {
  private config: Config;
  private documentStores: DocumentStores;
  private authID: AuthID;

  constructor(config: Config, documentStores: DocumentStores) {
    this.config = config;
    this.documentStores = documentStores;
  }

  public getHome(req: Request, res: Response): void {
    try {
      AdminService.isAuthorized(req);
      res.render(this.getPage("home"));
    } catch (err) {
      res.render(this.getPage("login"));
    }
  }

  /*
  * Create an AuthID authentication request
  */
  public async createAuthRequest(req: Request, res: Response): Promise<void> {
    try {
      if (!("id" in req.body))
        res.status(400).end();
      else {
        let session = req.session;

        let id = req.body["id"];
        session.userId = id;

        let authRequest = await this.authID.createAuthRequest(id);
        res.send(authRequest);
      }

    } catch (err) {
      res.status(500).send({ err: err.toString() });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      if (!("authResponse" in req.body))
        res.status(400).end();
      else {
        let verificationResult =
          await this.authID.verifyAuthResponse(req.body["authResponse"]);

        let session = req.session;

        if (verificationResult["verified"]
          && verificationResult["id"] == session.userId
          && session.userId == this.config.getRootAdmin()) {
          AdminService.authorizeAdmin(session);
        }

        this.getHome(req, res);
      }

    } catch (err) {
      res.status(500).send({ err: err.toString() });;
    }
  }

  public async createDocStore(req: Request, res: Response): Promise<void> {
    try {
      AdminService.isAuthorized(req);
    } catch (err) {
      res.status(401).end();
      return;
    }

    try {
      if (!("name" in req.body) || !("schema" in req.body))
        res.status(400).end();
      else {
        await this.documentStores.createDocumentStore(req.body["name"],
          req.body["schema"]);
        res.send({});
      }
    } catch (err) {
      res.status(500).send({ err: err.toString() });
    }
  }

  private getPage(page: string): string {
    return path.join(PAGES_DIR, page);
  }

  public init(): Promise<void> {
    return new Promise<void>(async (onSuccess: Function, onError: Function) => {
      try {
        this.authID = new AuthID();

        let ethDriver = await this.loadEthDriver();

        this.authID.setDriver(ETH, ETHB_DID, ethDriver);

        onSuccess();
      } catch (err) {
        onError(err);
      }
    });
  }

  private loadEthDriver(): Promise<AuthIDDriver> {
    return new Promise<AuthIDDriver>(async (onSuccess: Function, onError: Function) => {
      try {
        let ethDriverConfig = this.config.getDriverConfig("eth");

        let provider: any =
          new JsonRpcProvider(ethDriverConfig.get("eth_rpc_host"));
        let ethDriver =
          new EthAuthIDDriver(path.join(this.config.getAppDir(), "eth"),
            provider, ethDriverConfig.get("ipfs_host"),
            ethDriverConfig.get("eth_network"));

        await ethDriver.init();

        onSuccess(ethDriver);

      } catch (err) {
        onError(err);
      }
    });
  }

  private static isAuthorized(req: Request): void {
    let session = req.session;

    if (!session.loggedIn || !session.admin)
      throw new Error("Not authorized!");
  }

  private static authorizeAdmin(session: any): void {
    session.loggedIn = true; // log the user in
    session.admin = true;
  }
}
