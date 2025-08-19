const express = require("express");
const { ctrlGetRoomSnapshot } = require("../controllers/lobbyController");

const router = express.Router();

// Debug/admin: GET /api/lobby/rooms/:code
router.get("/rooms/:code", (req, res) => {
  const snap = ctrlGetRoomSnapshot({ code: req.params.code });
  if (!snap) return res.status(404).json({ error: "Not found" });
  res.json(snap);
});

module.exports = router;
