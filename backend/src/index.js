import app from "./app.js";
import { PORT } from "./constants/env.js";

const port = PORT;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
