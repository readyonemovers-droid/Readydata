import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import employeesRouter from "./employees";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(employeesRouter);
router.use(authRouter);

export default router;
