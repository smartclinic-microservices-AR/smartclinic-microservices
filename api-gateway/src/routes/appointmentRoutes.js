const express = require('express');
const { appointmentClient, callGrpc } = require('../grpc/clients');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const appointment = await callGrpc(appointmentClient, 'createAppointment', req.body);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await callGrpc(appointmentClient, 'listAppointments', {});
    res.json(result.appointments || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/patient/:patientId', async (req, res) => {
  try {
    const result = await callGrpc(appointmentClient, 'listAppointmentsByPatient', {
      patient_id: req.params.patientId,
    });
    res.json(result.appointments || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const result = await callGrpc(appointmentClient, 'listAppointmentsByDoctor', {
      doctor_id: req.params.doctorId,
    });
    res.json(result.appointments || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const appointment = await callGrpc(appointmentClient, 'getAppointment', {
      id: req.params.id,
    });
    res.json(appointment);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const appointment = await callGrpc(appointmentClient, 'updateAppointmentStatus', {
      id: req.params.id,
      status: req.body.status,
    });
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await callGrpc(appointmentClient, 'deleteAppointment', {
      id: req.params.id,
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;