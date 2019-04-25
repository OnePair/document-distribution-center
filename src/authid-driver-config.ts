import path from "path";
import fs from "fs";
import mkdirp from "mkdirp";

const DRIVERS_CONFIG_DIR = "authid-drivers";

export class AuthIDDriverConfig {
  private config: object;
  private path: string;
  private configPath: string;

  constructor(appDir: string, filename: string);
  constructor(appDir: string, filename: string, config: object)
  constructor(appDir: string, filename: string, config?: object) {
    this.path = path.join(appDir, DRIVERS_CONFIG_DIR);
    this.configPath = path.join(this.path, filename);
    this.config = config || {};
  }

  public set(key: string, value: string): void {
    this.config[key] = value;
    this.save();
  }

  public get(key: string): string {
    return this.config[key];
  }

  public save(): void {
    let configJson = JSON.stringify(this.config);
    fs.writeFileSync(this.configPath, configJson);
  }

  public initEnv(): void {
    // Create config if it does not exist
    if (!fs.existsSync(this.path)) {
      mkdirp.sync(this.path);
      this.save();
    } else {
      // load config from the file system
      let jsonConfig = fs.readFileSync(this.configPath).toString();
      this.config = JSON.parse(jsonConfig);
    }
  }
}
