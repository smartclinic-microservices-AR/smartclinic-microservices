const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const PROTO_PATH = path.join(__dirname, '../../proto/appointment.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const appointmentProto = grpc.loadPackageDefinition(packageDefinition).appointment;

function createAppointment(call, callback) {
  const { patient_id, doctor_id, date, reason } = call.request;

  if (!patient_id || !doctor_id || !date) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'patient_id, doctor_id and date are required',
    });
  }

  const appointment = {
    id: uuidv4(),
    patient_id,
    doctor_id,
    date,
    reason: reason || '',
    status: 'PENDING',
    created_at: new Date().toISOString(),
  };

  db.run(
    `INSERT INTO appointments (id, patient_id, doctor_id, date, reason, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      appointment.id,
      appointment.patient_id,
      appointment.doctor_id,
      appointment.date,
      appointment.reason,
      appointment.status,
      appointment.created_at,
    ],
    (err) => {
      if (err) {
        return callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      }

      callback(null, appointment);
    }
  );
}

function getAppointment(call, callback) {
  const { id } = call.request;

  db.get(`SELECT * FROM appointments WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    if (!row) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Appointment not found',
      });
    }

    callback(null, row);
  });
}

function listAppointments(call, callback) {
  db.all(`SELECT * FROM appointments`, [], (err, rows) => {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    callback(null, { appointments: rows });
  });
}

function updateAppointmentStatus(call, callback) {
  const { id, status } = call.request;

  if (!status) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'status is required',
    });
  }

  db.get(`SELECT * FROM appointments WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    if (!row) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Appointment not found',
      });
    }

    const updatedAppointment = {
      ...row,
      status,
    };

    db.run(
      `UPDATE appointments SET status = ? WHERE id = ?`,
      [status, id],
      (updateErr) => {
        if (updateErr) {
          return callback({
            code: grpc.status.INTERNAL,
            message: updateErr.message,
          });
        }

        callback(null, updatedAppointment);
      }
    );
  });
}

function deleteAppointment(call, callback) {
  const { id } = call.request;

  db.run(`DELETE FROM appointments WHERE id = ?`, [id], function (err) {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    if (this.changes === 0) {
      return callback(null, {
        success: false,
        message: 'Appointment not found',
      });
    }

    callback(null, {
      success: true,
      message: 'Appointment deleted successfully',
    });
  });
}

function listAppointmentsByPatient(call, callback) {
  const { patient_id } = call.request;

  db.all(
    `SELECT * FROM appointments WHERE patient_id = ?`,
    [patient_id],
    (err, rows) => {
      if (err) {
        return callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      }

      callback(null, { appointments: rows });
    }
  );
}

function listAppointmentsByDoctor(call, callback) {
  const { doctor_id } = call.request;

  db.all(
    `SELECT * FROM appointments WHERE doctor_id = ?`,
    [doctor_id],
    (err, rows) => {
      if (err) {
        return callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      }

      callback(null, { appointments: rows });
    }
  );
}

function main() {
  const server = new grpc.Server();

  server.addService(appointmentProto.AppointmentService.service, {
    createAppointment,
    getAppointment,
    listAppointments,
    updateAppointmentStatus,
    deleteAppointment,
    listAppointmentsByPatient,
    listAppointmentsByDoctor,
  });

  server.bindAsync(
    '0.0.0.0:50053',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Appointment Service error:', err);
        return;
      }

      console.log(`Appointment Service running on port ${port}`);
    }
  );
}

main();