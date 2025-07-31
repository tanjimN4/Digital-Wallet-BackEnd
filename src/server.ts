import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

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
(async()=>{
await startServer()
await seedSuperAdmin()
})()


process.on("SIGTERM", (ere) => {
  console.log("sigterm signal received", ere);
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})

process.on("unhandledRejection", (ere) => {
  console.log("unhandled rejection", ere);
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})
process.on("uncaughtException", (ere) => {
  console.log("unhandled exception", ere);
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})
