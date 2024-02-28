import { app } from "./src/app.js";
import { connectDB } from "./src/db/index.js";

// Connect your database here
connectDB()
  .then(() => {
    app.listen(8000);
    console.log("APP listening on port", 8000);
  })
  .catch((err) => console.error(err));
