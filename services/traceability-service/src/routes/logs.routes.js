const express = require('express');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

/**
 * GET /api/traceability/logs
 * Filtered list of audit logs (workOrderId, lotId, service, orderId)
 */
router.get('/', async (req, res) => {
  try {
    const { workOrderId, lotId, service, orderId } = req.query;
    
    const filter = {};
    if (service) {
      filter.service = service;
    }
    
    if (workOrderId) {
      filter['data.workOrderId'] = workOrderId;
    }

    if (orderId) {
      filter['$or'] = [
        { 'data.orderId': orderId },
        { 'data.workOrderId': orderId },
        { 'data.reference': orderId },
      ];
    }
    
    if (lotId) {
      filter['$or'] = [
        { 'data.lotId': lotId },
        { 'data.id': lotId }
      ];
    }

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(100);
    
    res.json({ status: 'success', data: logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ status: 'failure', error: { message: 'Failed to fetch logs' } });
  }
});

/**
 * GET /api/traceability/logs/journey/:orderNumber
 * Returns ALL events related to a sales order, ordered chronologically.
 * Step 1 — find events tied directly to the orderNumber (ORDER_CREATED, etc.)
 * Step 2 — collect all workOrderIds seen in those events
 * Step 3 — fetch all events tied to those workOrderIds (production, logistics, shipments)
 */
router.get('/journey/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    // Step 1: direct sales events
    const directLogs = await AuditLog.find({
      $or: [
        { 'data.orderNumber': orderNumber },
        { 'data.orderId': orderNumber },
      ]
    }).sort({ timestamp: 1 }).limit(200);

    // Step 2: extract workOrderIds from payloads
    const workOrderIds = new Set();
    for (const log of directLogs) {
      if (log.data?.workOrderId) workOrderIds.add(log.data.workOrderId);
      // ORDER_CREATED carries items with potential reference
      if (log.data?.reference)   workOrderIds.add(log.data.reference);
    }

    let allLogs = [...directLogs];

    // Step 3: fetch linked events by workOrderId
    if (workOrderIds.size > 0) {
      const ids = [...workOrderIds];
      const linkedLogs = await AuditLog.find({
        $or: [
          { 'data.workOrderId': { $in: ids } },
          { 'data.reference':   { $in: ids } },
          { 'data.id':          { $in: ids } },
        ]
      }).sort({ timestamp: 1 }).limit(500);

      // Merge, deduplicate by _id
      const seen = new Set(allLogs.map(l => l._id.toString()));
      for (const log of linkedLogs) {
        if (!seen.has(log._id.toString())) {
          allLogs.push(log);
          seen.add(log._id.toString());
        }
      }
    }

    // Sort chronologically
    allLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({ status: 'success', data: allLogs });
  } catch (error) {
    console.error('Error building journey:', error);
    res.status(500).json({ status: 'failure', error: { message: 'Failed to build order journey' } });
  }
});

module.exports = router;
