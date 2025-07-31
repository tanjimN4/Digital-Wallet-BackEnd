import express, { Request, Response } from "express";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";

const app=express()

app.use(express.json())
app.use("/api/v1",router)

app.get('/', (req: Request, res: Response) => {
  res.send('welcome to Digital Wallet server');
});

app.use(globalErrorHandler)

app.use(notFound)

export default app
