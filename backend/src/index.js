import app from "./app.js";
import { PORT } from "./constants/env.js";

const port = PORT;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://192.168.0.6:${port}`);
});
