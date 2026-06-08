import express from "express"
import { getNotifications } from "../db/redis.js"

export const router = express.Router()

// GET notifications utilisateur
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const notifications = await getNotifications(userId)

    res.json({
      status: "success",
      data: notifications
    })
  } catch (err) {
    res.status(500).json({
      status: "failure",
      error: err.message
    })
  }
})