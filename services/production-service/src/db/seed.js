require('dotenv').config()
const sequelize = require('./sequelize')
const { WorkOrder, Lot, Material, Incident, HistoryEntry } = require('../models')

const wo1 = '11111111-1111-1111-1111-111111111111'
const wo2 = '11111111-1111-1111-1111-111111111112'
const wo3 = '11111111-1111-1111-1111-111111111113'
const wo4 = '11111111-1111-1111-1111-111111111114'

const lot1 = '22222222-2222-2222-2222-222222222221'
const lot2 = '22222222-2222-2222-2222-222222222222'
const lot3 = '22222222-2222-2222-2222-222222222223'
const lot4 = '22222222-2222-2222-2222-222222222224'
const lot5 = '22222222-2222-2222-2222-222222222225'

const workOrdersData = [
  {
    id: wo1,
    reference: 'OF-2025-001',
    clientName: 'Airbus Group',
    priority: 'urgent',
    status: 'in_progress',
    createdAt: '2025-05-01T08:00:00Z',
    dueDate: '2025-05-20T18:00:00Z',
  },
  {
    id: wo2,
    reference: 'OF-2025-002',
    clientName: 'Safran Landing Systems',
    priority: 'normal',
    status: 'planned',
    createdAt: '2025-05-05T09:30:00Z',
    dueDate: '2025-06-01T18:00:00Z',
  },
  {
    id: wo3,
    reference: 'OF-2025-003',
    clientName: 'Dassault Aviation',
    priority: 'urgent',
    status: 'in_progress',
    createdAt: '2025-05-08T07:00:00Z',
    dueDate: '2025-05-18T18:00:00Z',
  },
  {
    id: wo4,
    reference: 'OF-2025-004',
    clientName: 'Thales Group',
    priority: 'normal',
    status: 'done',
    createdAt: '2025-04-15T09:00:00Z',
    dueDate: '2025-05-05T18:00:00Z',
  },
]

const lotsData = [
  {
    id: lot1,
    workOrderId: wo1,
    reference: 'LOT-2025-001-A',
    product: 'Vanne hydraulique HV-440',
    quantity: 50,
    status: 'done',
    startDate: '2025-05-01T08:00:00Z',
    dueDate: '2025-05-10T18:00:00Z',
    machine: 'CNC-07',
    completionPercent: 100,
  },
  {
    id: lot2,
    workOrderId: wo1,
    reference: 'LOT-2025-001-B',
    product: 'Vanne hydraulique HV-440',
    quantity: 50,
    status: 'in_progress',
    startDate: '2025-05-10T08:00:00Z',
    dueDate: '2025-05-20T18:00:00Z',
    machine: 'CNC-07',
    completionPercent: 64,
  },
  {
    id: lot3,
    workOrderId: wo2,
    reference: 'LOT-2025-002-A',
    product: 'Bras de train atterrissage TG-120',
    quantity: 8,
    status: 'planned',
    startDate: '2025-05-22T08:00:00Z',
    dueDate: '2025-06-01T18:00:00Z',
    machine: 'TOUR-03',
    completionPercent: 0,
  },
  {
    id: lot4,
    workOrderId: wo3,
    reference: 'LOT-2025-003-A',
    product: 'Actuateur électronique AE-900',
    quantity: 12,
    status: 'in_progress',
    startDate: '2025-05-08T07:00:00Z',
    dueDate: '2025-05-18T18:00:00Z',
    machine: 'CNC-12',
    completionPercent: 33,
  },
  {
    id: lot5,
    workOrderId: wo4,
    reference: 'LOT-2025-004-A',
    product: 'Support antenne radar SR-210',
    quantity: 30,
    status: 'done',
    startDate: '2025-04-15T09:00:00Z',
    dueDate: '2025-05-05T18:00:00Z',
    machine: 'CNC-04',
    completionPercent: 100,
  }
]

const materialsData = [
  { lotId: lot1, name: 'Alliage aluminium 7075', reference: 'AL-7075', quantity: 12, unit: 'kg', available: 45 },
  { lotId: lot1, name: 'Joint torique EPDM', reference: 'JT-EPDM-44', quantity: 50, unit: 'pcs', available: 200 },
  { lotId: lot2, name: 'Alliage aluminium 7075', reference: 'AL-7075', quantity: 12, unit: 'kg', available: 45 },
  { lotId: lot2, name: 'Joint torique EPDM', reference: 'JT-EPDM-44', quantity: 50, unit: 'pcs', available: 200 },
  { lotId: lot3, name: 'Acier inoxydable 316L', reference: 'SS-316L', quantity: 80, unit: 'kg', available: 150 },
  { lotId: lot3, name: 'Vis M8x30 inox', reference: 'VS-M8-30', quantity: 64, unit: 'pcs', available: 500 },
  { lotId: lot3, name: 'Roulement à billes SKF 6204', reference: 'RB-SKF-6204', quantity: 16, unit: 'pcs', available: 8 },
  { lotId: lot4, name: 'Titane Grade 5', reference: 'TI-G5', quantity: 5, unit: 'kg', available: 3 },
  { lotId: lot4, name: 'Connecteur M12 8 broches', reference: 'CN-M12-8', quantity: 24, unit: 'pcs', available: 50 },
  { lotId: lot5, name: 'Alliage aluminium 6061', reference: 'AL-6061', quantity: 20, unit: 'kg', available: 80 },
]

const incidentsData = [
  {
    lotId: lot2,
    severity: 'medium',
    description: 'Défaut de surface détecté sur 3 pièces – rayures superficielles côté bague.',
    reportedAt: '2025-05-14T10:22:00Z',
    reportedBy: 'Martin Dupont',
    resolved: false,
  },
  {
    lotId: lot4,
    severity: 'high',
    description: 'Rupture du foret Ø6mm en cours d\'usinage. Arrêt machine préventif. Vérification nécessaire avant reprise.',
    reportedAt: '2025-05-13T14:05:00Z',
    reportedBy: 'Martin Dupont',
    resolved: false,
  },
  {
    lotId: lot1,
    severity: 'low',
    description: 'Légère variation dimensionnelle sur 2 pièces (dans tolérance). Documenté pour traçabilité.',
    reportedAt: '2025-05-09T16:40:00Z',
    reportedBy: 'Martin Dupont',
    resolved: true,
  },
]

const historyData = [
  {
    action: 'Statut mis à jour',
    target: 'LOT-2025-001-B',
    targetId: lot2,
    performedBy: 'Martin Dupont',
    performedAt: '2025-05-15T08:10:00Z',
    detail: 'Passage de "Planifié" à "En cours"',
  },
  {
    action: 'Incident signalé',
    target: 'LOT-2025-001-B',
    targetId: lot2,
    performedBy: 'Martin Dupont',
    performedAt: '2025-05-14T10:22:00Z',
    detail: 'Incident #inc-001 créé – Sévérité : Moyenne',
  },
  {
    action: 'Avancement mis à jour',
    target: 'LOT-2025-001-B',
    targetId: lot2,
    performedBy: 'Martin Dupont',
    performedAt: '2025-05-14T07:55:00Z',
    detail: 'Progression : 40% → 64%',
  },
  {
    action: 'Incident signalé',
    target: 'LOT-2025-003-A',
    targetId: lot4,
    performedBy: 'Martin Dupont',
    performedAt: '2025-05-13T14:05:00Z',
    detail: 'Incident #inc-002 créé – Sévérité : Haute',
  },
  {
    action: 'Statut mis à jour',
    target: 'LOT-2025-001-A',
    targetId: lot1,
    performedBy: 'Martin Dupont',
    performedAt: '2025-05-10T17:30:00Z',
    detail: 'Passage de "En cours" à "Terminé"',
  },
  {
    action: 'Incident résolu',
    target: 'LOT-2025-001-A',
    targetId: lot1,
    performedBy: 'Martin Dupont',
    performedAt: '2025-05-09T16:40:00Z',
    detail: 'Incident #inc-003 marqué comme résolu',
  },
]

async function seed() {
  try {
    await sequelize.authenticate()
    console.log('Database connected for seeding.')

    // Insérer les données dans l'ordre pour respecter les clés étrangères
    await WorkOrder.bulkCreate(workOrdersData, { ignoreDuplicates: true })
    console.log('WorkOrders seeded.')

    await Lot.bulkCreate(lotsData, { ignoreDuplicates: true })
    console.log('Lots seeded.')

    await Material.bulkCreate(materialsData, { ignoreDuplicates: true })
    console.log('Materials seeded.')

    await Incident.bulkCreate(incidentsData, { ignoreDuplicates: true })
    console.log('Incidents seeded.')

    await HistoryEntry.bulkCreate(historyData, { ignoreDuplicates: true })
    console.log('History seeded.')

    console.log('All mock data seeded successfully.')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()