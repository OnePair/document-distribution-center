import { Application } from "express";
import { Config } from "../config";
import { DDCApiController, AdminController } from "./controllers";
import { DDCApiService, AdminService } from "./services";
import { DocumentStores } from "./stores";

import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import crypto from "crypto";

const VERSION = "/v0.0.1"
const DDC_API_ENDPOINT = VERSION + "/ddc/api";
const ADMIN_ENDPOINT = "/admin";
const CSS_ENDPOINT = "/css";
const LIB_ENDPOINT = "/lib";
const IMAGES_ENDPOINT = "/img";
const JS_ENDPOINT = "/js";

const COOKIE_MAX_AGE = 10 * 60000; // 10 minutes

/*
* document-distribution -center server
*/
export class DDCServer {
  private config: Config;
  private expressApp: Application;

  constructor(config: Config) {
    this.config = config;
  }

  public start(): void {
    this.expressApp.listen(this.config.getServerPort());
    console.log(`Server listening at http://localhost:${this.config.getServerPort()}/`);
  }

  public init(): Promise<void> {
    return new Promise<void>(async (onSuccess: Function, onError: Function) => {
      try {
        this.expressApp = express();
        this.expressApp.set("views", path.join(__dirname, "views/path"));
        this.expressApp.set("view engine", "ejs");
        this.expressApp.use(bodyParser.json()); // for json
        this.expressApp.use(express.urlencoded()); // for forms
        this.expressApp
          .use(CSS_ENDPOINT, express.static(path.join(__dirname, "views/css")));
        this.expressApp
          .use(IMAGES_ENDPOINT, express.static(path.join(__dirname, "views/img")));
        this.expressApp
          .use(JS_ENDPOINT, express.static(path.join(__dirname, "views/js")));
        this.expressApp
          .use(LIB_ENDPOINT, express.static(path.join(__dirname, "../../lib")));

        // Generate the session secret
        let secret = crypto.randomBytes(32).toString("hex");
        this.expressApp.use(session({
          secret: secret,
          cookie: { maxAge: COOKIE_MAX_AGE },
          resave: false,
          saveUninitialized: true
        }));

        // Connect to IPFS
        DocumentStores.connectToIpfs(this.config.getIpfsHost());

        // Get the DB objects
        let documentStores = new DocumentStores(this.config);
        await documentStores.load();


        let ddcService = new DDCApiService(documentStores);
        let adminService = new AdminService(this.config, documentStores);

        await adminService.init();

        let ddcController = new DDCApiController(ddcService);
        let adminController = new AdminController(adminService);

        // Load the roots
        this.expressApp.use(DDC_API_ENDPOINT, ddcController.getRouter());
        this.expressApp.use(ADMIN_ENDPOINT, adminController.getRouter());

        onSuccess();
      } catch (err) {
        onError(err);
      }
    });
  }

}
