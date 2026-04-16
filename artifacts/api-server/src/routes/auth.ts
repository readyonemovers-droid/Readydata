import { Router, type IRouter, type Request, type Response } from "express";
import { AdminLoginBody, AdminLoginResponse, AdminLogoutResponse, GetAuthSessionResponse } from "@workspace/api-zod";

const ADMIN_PHONE = "0798940935";
const ADMIN_PASSWORD = "lestaz";

const router: IRouter = Router();

router.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { phone, password } = parsed.data;

  if (phone !== ADMIN_PHONE || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials. Access denied." });
    return;
  }

  (req.session as { isAdmin?: boolean }).isAdmin = true;
  res.json(AdminLoginResponse.parse({ authenticated: true }));
});

router.post("/auth/logout", async (req: Request, res: Response): Promise<void> => {
  req.session.destroy(() => {
    res.json(AdminLogoutResponse.parse({ authenticated: false }));
  });
});

router.get("/auth/session", async (req: Request, res: Response): Promise<void> => {
  const isAdmin = (req.session as { isAdmin?: boolean }).isAdmin === true;
  res.json(GetAuthSessionResponse.parse({ authenticated: isAdmin }));
});

export default router;
