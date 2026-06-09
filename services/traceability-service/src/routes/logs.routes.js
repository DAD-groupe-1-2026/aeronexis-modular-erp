const express = require('express');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { workOrderId, lotId, service } = req.query;
    
    // Build filter
    const filter = {};
    if (service) {
      filter.service = service;
    }
    
    if (workOrderId) {
      filter['data.workOrderId'] = workOrderId;
    }
    
    if (lotId) {
      // If lotId is passed, it could be inside 'data.lotId' or 'data.id' (for LOT_UPDATED events)
      filter['$or'] = [
        { 'data.lotId': lotId },
        { 'data.id': lotId }
      ];
    }

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(100);
    
    res.json({
      status: 'success',
      data: logs
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ status: 'failure', error: { message: 'Failed to fetch logs' } });
  }
});

module.exports = router;
