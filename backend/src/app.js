import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import "./cronJobs.js";

const app = express();

app.use (
    cors ({
        origin:"http://localhost:5173", 
        credentials: true,
    })
);

app.use (
    express.json ({
        limit: "16kb"
    })
);

app.use (
    express.urlencoded ({
        extended: true,
        limit: "16kb"
    })
);

app.use (express.static ("public"))
app.use(cookieParser())


// routes import
import userRouter from "./routes/userRoutes.js";
import productCategoryRouter from "./routes/productCategoryRoutes.js";
import auctionRouter from "./routes/auctionRoutes.js";
import bidRouter from "./routes/bidRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import cityRouter from "./routes/cityRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/product-categories", productCategoryRouter);
app.use("/api/v1/auctions", auctionRouter);
app.use("/api/v1/bids", bidRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/cities", cityRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/payments", paymentRouter);


export { app }