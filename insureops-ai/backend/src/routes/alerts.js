/**
 * Alerts Routes
 * GET /api/alerts — all alerts with filters
 * GET /api/alerts/active — unacknowledged alerts
 * PUT /api/alerts/:id/acknowledge — mark alert as acknowledged
 * GET /api/alerts/rules — list all alert rules
 * POST /api/alerts/rules — create a new alert rule
 * DELETE /api/alerts/rules/:id — delete an alert rule
 */

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

/**
 * GET /api/alerts/active
 * Returns unacknowledged alerts sorted by severity and time
 */
router.get('/active', async (req, res) => {
    try {
        const { Alert, AlertRule } = req.app.locals.models;

        const alerts = await Alert.findAll({
            where: { acknowledged: false },
            order: [
                ['severity', 'ASC'], // critical first
                ['created_at', 'DESC']
            ],
            limit: 50
        });

        res.json(alerts);
    } catch (error) {
        console.error('Active alerts error:', error.message);
        res.status(500).json({ error: 'Failed to fetch active alerts' });
    }
});

/**
 * GET /api/alerts/rules
 * Returns all alert rules
 */
router.get('/rules', async (req, res) => {
    try {
        const { AlertRule } = req.app.locals.models;
        const rules = await AlertRule.findAll({
            order: [['created_at', 'ASC']]
        });
        res.json(rules);
    } catch (error) {
        console.error('Alert rules error:', error.message);
        res.status(500).json({ error: 'Failed to fetch alert rules' });
    }
});

/**
 * POST /api/alerts/rules
 * Create a new alert rule
 * Body: { name, metric, condition, threshold, severity, agent_type?, enabled? }
 */
router.post('/rules', async (req, res) => {
    try {
        const { AlertRule } = req.app.locals.models;
        const { name, metric, condition, threshold, severity, agent_type, enabled } = req.body;

        if (!name || !metric || !condition || threshold === undefined || !severity) {
            return res.status(400).json({
                error: 'name, metric, condition, threshold, and severity are required'
            });
        }

        const rule = await AlertRule.create({
            name,
            metric,
            condition,
            threshold: parseFloat(threshold),
            severity,
            agent_type: agent_type || null,
            enabled: enabled !== false
        });

        res.status(201).json(rule);
    } catch (error) {
        console.error('Create alert rule error:', error.message);
        res.status(500).json({ error: 'Failed to create alert rule' });
    }
});

/**
 * DELETE /api/alerts/rules/:id
 * Delete an alert rule
 */
router.delete('/rules/:id', async (req, res) => {
    try {
        const { AlertRule } = req.app.locals.models;
        const rule = await AlertRule.findByPk(req.params.id);

        if (!rule) {
            return res.status(404).json({ error: 'Alert rule not found' });
        }

        await rule.destroy();
        res.json({ success: true, message: 'Alert rule deleted' });
    } catch (error) {
        console.error('Delete alert rule error:', error.message);
        res.status(500).json({ error: 'Failed to delete alert rule' });
    }
});

/**
 * PUT /api/alerts/:id/acknowledge
 * Mark an alert as acknowledged
 */
router.put('/:id/acknowledge', async (req, res) => {
    try {
        const { Alert } = req.app.locals.models;
        const alert = await Alert.findByPk(req.params.id);

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        await alert.update({
            acknowledged: true,
            acknowledged_at: new Date()
        });

        res.json({ success: true, alert });
    } catch (error) {
        console.error('Acknowledge alert error:', error.message);
        res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
});

/**
 * GET /api/alerts
 * Query: ?severity=critical|warning|info&acknowledged=true|false&date_from=...&date_to=...
 */
router.get('/', async (req, res) => {
    try {
        const { Alert } = req.app.locals.models;
        const { severity, acknowledged, date_from, date_to, page = 1, limit = 50 } = req.query;

        const where = {};
        if (severity) where.severity = severity;
        if (acknowledged !== undefined) where.acknowledged = acknowledged === 'true';
        if (date_from || date_to) {
            where.created_at = {};
            if (date_from) where.created_at[Op.gte] = new Date(date_from);
            if (date_to) where.created_at[Op.lte] = new Date(date_to);
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { rows, count } = await Alert.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            alerts: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalItems: count,
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Alerts list error:', error.message);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

module.exports = router;
