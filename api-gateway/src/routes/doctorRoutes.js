const express = require('express');
const { doctorClient, callGrpc } = require('../grpc/clients');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const doctor = await callGrpc(doctorClient, 'createDoctor', req.body);
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await callGrpc(doctorClient, 'listDoctors', {});
    res.json(result.doctors || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const result = await callGrpc(doctorClient, 'searchDoctorsBySpecialty', {
      specialty: req.query.specialty || '',
    });
    res.json(result.doctors || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doctor = await callGrpc(doctorClient, 'getDoctor', {
      id: req.params.id,
    });
    res.json(doctor);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const doctor = await callGrpc(doctorClient, 'updateDoctor', {
      id: req.params.id,
      ...req.body,
    });
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await callGrpc(doctorClient, 'deleteDoctor', {
      id: req.params.id,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id/availability', async (req, res) => {
  try {
    const result = await callGrpc(doctorClient, 'checkDoctorAvailability', {
      doctor_id: req.params.id,
      date: req.query.date || '',
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;