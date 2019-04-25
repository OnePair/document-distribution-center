import { Config } from "../../config";
import { AuthID } from "authid-core-ts";
import { Validator } from "jsonschema"

import Level from "level";
import path from "path";
import mkdirp from "mkdirp";
import JWT from "jsonwebtoken";

const DOC_STORES_DIR = "doc-stores/";

export class DocumentStore {
  private db: Level;
  private schema: object;

  constructor(config: Config, name: string, schema: object) {
    this.db = Level(DocumentStore.getDBPath(config, name));
    this.schema = schema;
  }

  public async setDocument(authID: AuthID, jwt: string): Promise<void> {
    let signedValues = await JWT.decode(jwt);

    let document = signedValues["document"];

    // Validate the schema
    let schemaValidator = new Validator();
    var schemaValid = schemaValidator.validate(document, this.schema).valid;

    if (!schemaValid)
      throw new Error("Schema is not valid!");

    let issuerId = DocumentStore.getIssuerId(signedValues);

    // Verify the signature
    await authID.verifyJwt(jwt, issuerId, "signing");

    // Now save the document
    await this.db.put(issuerId, jwt);
  }

  public async getDocument(id: string): Promise<string> {
    let document = await this.db.get(id);
    return document;
  }

  private static getIssuerId(signedValues: any): string {
    let issuerId: string;

    if ("name" in signedValues)
      issuerId = signedValues["name"];
    else { // The issuer is just a DID
      // 4) Get the signer's id
      let issuer = signedValues["issuer"];

      if (issuer["type"] == "processor") {
        let processor = JWT.decode(issuer["processor"]);
        let processorIssuer = processor["issuer"];

        if ("did" in processorIssuer)
          issuerId = processorIssuer["did"];
        else
          issuerId = processorIssuer["id"];
      } else {
        issuerId = issuer["did"]
      }
    }
    return issuerId;
  }

  private static getDBPath(config: Config, dbName: string): string {
    let dbPath = path.join(config.getAppDir(),
      path.join(DOC_STORES_DIR, dbName + ".db"));
    mkdirp.sync(dbPath);

    return dbPath;
  }

}
