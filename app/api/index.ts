// Import global routes
import path from "node:path";
import { pathToFileURL } from "node:url";
import routes from "./routes";
import { initializeModels } from "./models";
import type { Router } from "express";

// Initialize all module models first
await initializeModels();

// Initialize the task model explicitly (app/tasks is outside app/modules, so auto-discovery skips it)
const taskModelFile = path.join(process.cwd(), "app", "tasks", "src", "models", "task.model.ts");
await import(pathToFileURL(taskModelFile).href);

// Register task routes using the same pathToFileURL pattern that the auto-discovery uses,
// since static ~/alias imports can fail to resolve under tsx at runtime.
const taskRoutesFile = path.join(process.cwd(), "app", "tasks", "src", "routes", "tasks.routes.ts");
const tasksModule = (await import(pathToFileURL(taskRoutesFile).href)) as { default: Router };
routes.use(tasksModule.default);

export default routes;
