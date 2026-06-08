// Logique métier pure

export function buildNotification(event) {
  switch (event.type) {
    case "STOCK_LOW":
      return {
        userId: event.userId,
        type: "warning",
        title: "Stock faible",
        message: `${event.productName} est sous le seuil critique`,
        createdAt: new Date()
      }

    case "ORDER_CREATED":
      return {
        userId: event.userId,
        type: "info",
        title: "Nouvelle commande",
        message: `Commande #${event.orderId} créée`,
        createdAt: new Date()
      }

    case "PRODUCTION_FINISHED":
      return {
        userId: event.userId,
        type: "success",
        title: "Production terminée",
        message: `Lot ${event.lotId} terminé`,
        createdAt: new Date()
      }

    default:
      return null
  }
}