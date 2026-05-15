const express = require('express');
const { patientClient, callGrpc } = require('../grpc/clients');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const patient = await callGrpc(patientClient, 'createPatient', req.body);
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await callGrpc(patientClient, 'listPatients', {});
    res.json(result.patients || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const result = await callGrpc(patientClient, 'searchPatients', {
      name: req.query.name || '',
    });
    res.json(result.patients || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const patient = await callGrpc(patientClient, 'getPatient', {
      id: req.params.id,
    });
    res.json(patient);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const patient = await callGrpc(patientClient, 'updatePatient', {
      id: req.params.id,
      ...req.body,
    });
    res.json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await callGrpc(patientClient, 'deletePatient', {
      id: req.params.id,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;