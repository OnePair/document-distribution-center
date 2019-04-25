import { Config } from "./config";
import { DDCServer } from "./server/ddc-server";

export function startServer(dirPath: string): Promise<void> {
  return new Promise<void>(async (onSuccess: Function, onError: Function) => {
    try {
      let config = new Config(dirPath);
      await config.initEnv();

      let server = new DDCServer(config);

      await server.init();
      server.start();

      onSuccess();
    } catch (err) {
      onError(err);
    }
  });
}
