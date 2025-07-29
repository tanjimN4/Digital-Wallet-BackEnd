import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./config/env";

let server :Server
const startServer = async () => {
  try {
    await mongoose.connect(envVars.MONGODB_URL)
    console.log('connect');

    server = app.listen(envVars.PORT, () => {
      console.log(`server is listening to port ${envVars.PORT}`);

    })
  } catch (error) {
    console.log(error);
  }
}

startServer()