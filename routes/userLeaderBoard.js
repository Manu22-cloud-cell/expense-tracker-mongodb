const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../controller/leaderBoardController");
const auth = require("../middleware/auth");
const premiumMiddleware=require("../middleware/premiumMiddleware");

router.get("/leaderboard", auth, premiumMiddleware, getLeaderboard);

module.exports = router;







