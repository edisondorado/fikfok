require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDb = require("./database/db");

const authRouter = require("./routes/auth.route");
const profileRouter = require('./routes/profile.route');
const videoRouter = require('./routes/video.route');
const searchRouter = require('./routes/search.route');
const messageRouter = require("./routes/message.route");

const errorMiddleware = require("./middleware/error-middleware");
const authMiddleware = require("./middleware/auth-middleware");

const scheduleService = require("./service/schedule-service");

connectDb(process.env.DB_URI);

const app = express();
const PORT = process.env.PORT || 3001

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/video", videoRouter);
app.use("/search", searchRouter);
app.use("/message", authMiddleware, messageRouter);

setInterval(async () => scheduleService.uploadScheduledVideo(), 30000);

app.use(errorMiddleware);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})