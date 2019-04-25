import { Config } from "../../config";

import Level from "level";
import path from "path";

const DB_FILENAME = "metadata.db";
const DOC_STORES = "doc_stores";

export class MetaDataStore {
  private dbPath: string;
  private db: Level;

  constructor(config: Config) {
    this.dbPath = path.join(config.getAppDir(), DB_FILENAME);
    this.db = Level(this.dbPath);
  }

  /*
  * @param {string} name The name of the document type.
  * @param {string} schemaAddress The schema of the document.
  */
  public async setDocumentStore(name: string, schemaAddress: string) {
    let docStores: object;

    try {
      let docStoresString = await this.db.get(DOC_STORES);
      docStores = JSON.parse(docStoresString);

      if (!(name in docStores)) {
        docStores[name] = schemaAddress;
        await this.db.put(DOC_STORES, JSON.stringify(docStores));
      }
    } catch (err) {
      docStores = {};
      docStores[name] = schemaAddress;

      await this.db.put(DOC_STORES, JSON.stringify(docStores));
    }
  }

  public async getDocumentStores(): Promise<object> {
    let docStores: object;

    try {
      let docStoresString = await this.db.get(DOC_STORES);
      docStores = JSON.parse(docStoresString);
    } catch (err) {
      docStores = {};
    }

    return docStores;
  }
}
