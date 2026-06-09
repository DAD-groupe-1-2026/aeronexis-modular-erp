// Logique métier pure

export function buildNotification(event) {
  const type = event.eventType || event.type;
  const data = event.data || event;

  switch (type) {
    case "STOCK_LOW":
      return {
        userId: data.userId || 'system',
        type: "warning",
        title: "Stock faible",
        message: `${data.productName} est sous le seuil critique`,
        createdAt: new Date()
      }

    case "ORDER_CREATED":
      return {
        userId: data.userId || 'system',
        type: "info",
        title: "Nouvelle commande",
        message: `Commande #${data.orderId} créée`,
        createdAt: new Date()
      }

    case "PRODUCTION_FINISHED":
    case "LOT_COMPLETED":
      return {
        userId: data.userId || 'system',
        type: "success",
        title: "Production terminée",
        message: `Lot ${data.lotId || data.reference} terminé`,
        createdAt: new Date()
      }

    case "MATERIAL_REQUESTED":
      return {
        targetApp: 'logistics',
        userId: 'system', 
        type: "info",
        title: "Demande de Matières",
        message: `${data.requestedBy || 'Utilisateur inconnu'} (Site: ${data.siteName || 'Site Inconnu'}) réclame ${data.quantity} unité(s) de la matière ${data.materialCode || data.reference}`,
        createdAt: new Date()
      }

    case "RESERVATION_MESSAGE":
      return {
        targetApp: 'production',
        userId: 'system',
        type: "info",
        title: `Message de la Logistique (Réservation ${data.reservationId || ''})`,
        message: data.message,
        createdAt: new Date()
      }

    default:
      return null
  }
}