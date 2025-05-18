import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import cookieParser from 'cookie-parser';
import notificationRoutes from "./routes/notification.route.js";
import userRoutes from "./routes/user.route.js";

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Welcome to the Notifications API");
});


app.use("/notifications", notificationRoutes);
app.use("/users", userRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });

    import("./queue/consumer.js");
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err);
  });
