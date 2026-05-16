const express = require('express');
const { notificationClient, callGrpc } = require('../grpc/clients');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const notification = await callGrpc(notificationClient, 'createNotification', req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await callGrpc(notificationClient, 'listNotifications', {});
    res.json(result.notifications || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/patient/:patientId', async (req, res) => {
  try {
    const result = await callGrpc(notificationClient, 'listNotificationsByPatient', {
      patient_id: req.params.patientId,
    });
    res.json(result.notifications || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const notification = await callGrpc(notificationClient, 'getNotification', {
      id: req.params.id,
    });
    res.json(notification);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const notification = await callGrpc(notificationClient, 'markNotificationAsRead', {
      id: req.params.id,
    });
    res.json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;