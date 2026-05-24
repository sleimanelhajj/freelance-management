import app from "./app";
import { env } from "./config/env";

const PORT: number = env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
