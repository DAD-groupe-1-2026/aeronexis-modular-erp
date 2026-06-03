import Redis from "ioredis"

export const redis = new Redis(process.env.REDIS_URL)

// Stocke notification
export async function saveNotification(userId, notification) {
  await redis.lpush(
    `notifications:${userId}`,
    JSON.stringify(notification)
  )

  await redis.ltrim(`notifications:${userId}`, 0, 49)
}

// Récupère notifications
export async function getNotifications(userId) {
  const data = await redis.lrange(`notifications:${userId}`, 0, -1)
  return data.map((n) => JSON.parse(n))
}