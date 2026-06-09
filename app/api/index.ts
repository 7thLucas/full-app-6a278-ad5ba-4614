// Import global routes
import routes from "./routes";
import { initializeModels } from "./models";
import tasksRouter from "~/tasks/src/routes/tasks.routes";

// Initialize all module models first
await initializeModels();
// Ensure task model is registered with Mongoose before routes are used
await import("~/tasks/src/models/task.model");

// Register task routes (app/tasks lives outside app/modules, so auto-discovery skips it)
// Mount without prefix so the router's own path definitions (/tasks, /tasks/:id) take effect
routes.use(tasksRouter);

export default routes;
