import app from "./app";
import { env } from "process";

const PORT: number = env.PORT ? parseInt(env.PORT) : 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
