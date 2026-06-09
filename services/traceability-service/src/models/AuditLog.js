const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    eventType: {
        type: String,
        required: true
    },//Type of event (e.g., 'CREATE', 'UPDATE', 'DELETE')

    service: {
        type: String,
        required: true
    },//Service that triggered the event

    userId: {
        type: Number
    }, //ID of the user who triggered the event (if applicable)

    data: {
        type: mongoose.Schema.Types.Mixed
    },    //Additional data related to the event (e.g., payload, changes)

    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model(
    'AuditLog',
    AuditLogSchema
);