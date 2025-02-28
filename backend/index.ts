import express, { Request, Response } from "express";
import dbConfig from "./src/config/dbConfig";

const app = express();

dbConfig()
  .then(() => {
    const port: number = parseInt(process.env.PORT || "3000", 10);
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((error: Error) => {
    console.error("Failed to connect to database", error);
  });

app.get("/", (req: Request, res: Response): void => {
  res.send("home");
});
