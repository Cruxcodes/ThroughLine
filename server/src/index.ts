import "./config";
import express from "express";
import cors from "cors";
import { briefRouter } from "./routes/brief";
import { entryRouter } from "./routes/entry";
import { universitiesRouter } from "./routes/universities";
import { rateLimit, requireApiKey } from "./middleware/guard";
import { config } from "./config";

export const app = express();

// Must be set before any middleware reads req.ip. A bare hop count arrives as a
// string from the environment; Express needs the number, or it treats it as an
// IP list and trusts nothing.
if (config.trustProxy) {
  const hops = Number(config.trustProxy);
  app.set("trust proxy", Number.isInteger(hops) ? hops : config.trustProxy);
}

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api", rateLimit, requireApiKey);
app.use("/api/brief", briefRouter);
app.use("/api/entry", entryRouter);
app.use("/api/universities", universitiesRouter);

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => console.log(`server on :${port}`));
}
