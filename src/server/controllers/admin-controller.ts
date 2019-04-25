import { Router, Request, Response } from "express";
import { AdminService } from "../services/admin-service";

/*
* TODO: List https://bootsnipp.com/snippets/O2KO
*/
export class AdminController {
  private adminService: AdminService;
  private router: Router;

  constructor(adminService: AdminService) {
    this.adminService = adminService;
    this.router = Router();
    this.createRoutes();
  }

  private createRoutes(): void {
    this.router.get("/", (req: Request, res: Response) => {
      this.adminService.getHome(req, res);
    });

    this.router.post("/authRequest", (req: Request, res: Response) => {
      this.adminService.createAuthRequest(req, res);
    });

    this.router.post("/login", (req: Request, res: Response) => {
      this.adminService.login(req, res);
    });

    this.router.post("/createDocumentStore", (req: Request, res: Response) => {
      this.adminService.createDocStore(req, res);
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
