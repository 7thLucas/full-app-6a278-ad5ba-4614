// Import global routes
import routes from "./routes";
import { initializeModels } from "./models";
import tasksRouter from "~/tasks/src/routes/tasks.routes";

// Initialize models
await initializeModels();
// Initialize task model
await import("~/tasks/src/models/task.model");

// Register feature routes
routes.use(tasksRouter);

export default routes;
