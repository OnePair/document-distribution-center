import { Config } from "../../config";
import { MetaDataStore, DocumentStore } from "../stores";
import { AuthID, AuthIDDriver } from "authid-core-ts";
import { EthAuthIDDriver } from "authid-eth-driver";
import { JsonRpcProvider } from "ethers/providers";

import IPFSApi from "ipfs-http-client";
import path from "path";

const ETH = "ETH";
const ETHB_DID = "ethb";

export class DocumentStores {
  private static ipfsApi: IPFSApi;

  private config: Config;
  private metaDataStore: MetaDataStore;
  private documentStores: object;
  private authID: AuthID;

  constructor(config: Config) {
    this.config = config;
    this.metaDataStore = new MetaDataStore(config);
  }

  public async createDocumentStore(name: string, schema: object) {
    // 1) Check if the store exists.
    let docStores = await this.metaDataStore.getDocumentStores();

    if (name in docStores)
      return;

    // 2) store the schema on IPFS.
    let encodedSchema = Buffer.from(JSON.stringify(schema));

    let ipfs = await DocumentStores.ipfsApi.add(encodedSchema);
    let schemaAddress = ipfs[0]["hash"]

    // 3) Create the store
    let documentStore = new DocumentStore(this.config, name, schema);
    this.documentStores[schemaAddress] = documentStore;
    this.metaDataStore.setDocumentStore(name, schemaAddress);
  }

  public async setDocument(schemaAddress: string,
    jwt: string): Promise<void> {
    if (!(schemaAddress in this.documentStores))
      throw new Error("The provided schema is not supported by this instance.");

    let documentStore = this.documentStores[schemaAddress];

    await documentStore.setDocument(this.authID, jwt);
  }

  public async getDocument(schemaAddress: string, id: string): Promise<string> {
    if (!(schemaAddress in this.documentStores))
      throw new Error("The provided schema is not supported by this instance.");

    let documentStore = this.documentStores[schemaAddress];
    let document = await documentStore.getDocument(id);

    return document;
  }

  public async getDocumentStores(): Promise<object> {
    return this.metaDataStore.getDocumentStores();
  }

  public async load(): Promise<void> {
    this.authID = await this.loadAuthID();
    // Load the document stores
    var docStores = await this.getDocumentStores();

    this.documentStores = {}

    for (var name in docStores) {
      var schemaHash = docStores[name];
      var schemaEncoded = await DocumentStores.ipfsApi.cat(schemaHash);
      var schema = JSON.parse(schemaEncoded.toString());

      this.documentStores[schemaHash] =
        new DocumentStore(this.config, name, schema);
    }
  }

  private loadAuthID(): Promise<AuthID> {
    return new Promise<AuthID>(async (onSuccess: Function, onError: Function) => {
      try {
        let authID = new AuthID();

        let ethDriver = await this.loadEthDriver();

        authID.setDriver(ETH, ETHB_DID, ethDriver);

        onSuccess(authID);
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

  /*
  * Connect to an ipfs node.
  *
  * @param {string} apiUrl The api url if the ipfs node.
  */
  public static connectToIpfs(apiUrl: string): void {
    if (DocumentStores.ipfsApi == undefined)
      DocumentStores.ipfsApi = IPFSApi(apiUrl);
  }
}
