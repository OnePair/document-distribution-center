import { Router, Request, Response } from "express";
import { DDCApiService } from "../services/ddc-api-service";

export class DDCApiController {
  private ddcService: DDCApiService;
  private router: Router;

  constructor(ddcService: DDCApiService) {
    this.ddcService = ddcService;
    this.router = Router();
    this.createRoutes();
  }

  private createRoutes(): void {
    this.router.get("/", (req: Request, res: Response) => {
      res.send("Document Distribution Center");
    });

    this.router.get("/documentStores", (req: Request, res: Response) => {
      this.ddcService.getDocumentStores(req, res);
    });

    this.router.post("/setDocument", (req: Request, res: Response) => {
      this.ddcService.setDocument(req, res);
    });

    this.router.get("/documentStores/:schemaAddress/:id",
      (req: Request, res: Response) => {
        this.ddcService.getDocument(req, res);
      });
  }

  public getRouter(): Router {
    return this.router;
  }
}
