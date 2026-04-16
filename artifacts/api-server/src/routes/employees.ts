import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, employeesTable } from "@workspace/db";
import {
  ListEmployeesResponse,
  CreateEmployeeBody,
  GetEmployeeParams,
  GetEmployeeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response): boolean {
  const session = req.session as { isAdmin?: boolean };
  if (!session.isAdmin) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.get("/employees", async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const employees = await db
    .select()
    .from(employeesTable)
    .orderBy(employeesTable.created_at);

  res.json(ListEmployeesResponse.parse(employees));
});

router.post("/employees", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateEmployeeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [employee] = await db
    .insert(employeesTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(GetEmployeeResponse.parse(employee));
});

router.get("/employees/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetEmployeeParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [employee] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.id, params.data.id));

  if (!employee) {
    res.status(404).json({ error: "Employee not found" });
    return;
  }

  res.json(GetEmployeeResponse.parse(employee));
});

export default router;
