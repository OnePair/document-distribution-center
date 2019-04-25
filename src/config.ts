import { homedir } from "os";
import { AuthIDDriverConfig } from "./authid-driver-config";

import path from "path";
import fs from "fs";
import mkdirp from "mkdirp";

export const DEFAULT_APP_DIR = path.join(homedir(), ".document-distribution-center");

const DRIVER_CONFIGS_PATH = path.join(__dirname, "../driver-configs");
const CONFIG_FILENAME = "config.json";

const SERVER_PORT = "server_port";
const ROOT_ADMIN = "root_admin";
const IPFS_HOST = "ipfs_host";


const DEFAULT_SERVER_PORT = 8888;
const DEFAULT_IPFS_HOST = "/ip4/127.0.0.1/tcp/5001";

export class Config {
  private config: Object;
  private path: string;
  private configPath: string;

  constructor();
  constructor(dirPath: string);
  constructor(dirPath?: string) {
    this.path = !(dirPath) ? DEFAULT_APP_DIR : dirPath;
    this.configPath = path.join(this.path, CONFIG_FILENAME);
  }

  public getServerPort(): number {
    return this.config[SERVER_PORT];
  }

  public getRootAdmin(): string {
    return this.config[ROOT_ADMIN];
  }

  public getDriverConfig(name: string): AuthIDDriverConfig {
    let driverConfig = new AuthIDDriverConfig(this.path,
      name + ".json");
    driverConfig.initEnv();
    return driverConfig;
  }

  public getAppDir(): string {
    return this.path;
  }

  public getIpfsHost(): string {
    return this.config[IPFS_HOST];
  }

  public save(): void {
    let configJson = JSON.stringify(this.config);
    fs.writeFileSync(this.configPath, configJson);
  }

  public initEnv(): Promise<void> {
    return new Promise<void>(async (onSuccess: Function) => {
      // Create config if it does not exist
      if (!fs.existsSync(this.configPath)) {
        mkdirp.sync(this.path);
        this.config = this.getDefaultConfig();
        this.save();
      } else {
        // load config from the file system
        let jsonConfig = fs.readFileSync(this.configPath).toString();
        this.config = JSON.parse(jsonConfig);
      }

      await this.setupDefaultDriverConfigs();

      onSuccess();
    });
  }

  private getDefaultConfig(): object {
    return {
      [SERVER_PORT]: DEFAULT_SERVER_PORT,
      [IPFS_HOST]: DEFAULT_IPFS_HOST
    };
  }

  private setupDefaultDriverConfigs(): Promise<void> {
    return new Promise<void>((onSuccess: Function, onError: Function) => {
      fs.readdir(DRIVER_CONFIGS_PATH, (err, files) => {
        if (err)
          onError(err);
        else {
          files.forEach(filename => {
            let driverConfigPath = path.join(DRIVER_CONFIGS_PATH, filename);
            let jsonConfig = fs.readFileSync(driverConfigPath).toString();
            let driverConfigJson = JSON.parse(jsonConfig);

            let driverConfig = new AuthIDDriverConfig(this.path, filename,
              driverConfigJson)
            driverConfig.initEnv();
          });
          onSuccess();
        }
      });
    });
  }
}
