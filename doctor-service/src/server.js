const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const PROTO_PATH = path.join(__dirname, '../../proto/doctor.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const doctorProto = grpc.loadPackageDefinition(packageDefinition).doctor;

function createDoctor(call, callback) {
  const { full_name, specialty, email, phone } = call.request;

  if (!full_name || !specialty || !email || !phone) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'full_name, specialty, email and phone are required',
    });
  }

  const doctor = {
    id: uuidv4(),
    full_name,
    specialty,
    email,
    phone,
    created_at: new Date().toISOString(),
  };

  db.run(
    `INSERT INTO doctors (id, full_name, specialty, email, phone, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      doctor.id,
      doctor.full_name,
      doctor.specialty,
      doctor.email,
      doctor.phone,
      doctor.created_at,
    ],
    (err) => {
      if (err) {
        return callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      }

      callback(null, doctor);
    }
  );
}

function getDoctor(call, callback) {
  const { id } = call.request;

  db.get(`SELECT * FROM doctors WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    if (!row) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Doctor not found',
      });
    }

    callback(null, row);
  });
}

function listDoctors(call, callback) {
  db.all(`SELECT * FROM doctors`, [], (err, rows) => {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    callback(null, { doctors: rows });
  });
}

function updateDoctor(call, callback) {
  const { id, full_name, specialty, email, phone } = call.request;

  db.get(`SELECT * FROM doctors WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    if (!row) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Doctor not found',
      });
    }

    const updatedDoctor = {
      id,
      full_name: full_name || row.full_name,
      specialty: specialty || row.specialty,
      email: email || row.email,
      phone: phone || row.phone,
      created_at: row.created_at,
    };

    db.run(
      `UPDATE doctors
       SET full_name = ?, specialty = ?, email = ?, phone = ?
       WHERE id = ?`,
      [
        updatedDoctor.full_name,
        updatedDoctor.specialty,
        updatedDoctor.email,
        updatedDoctor.phone,
        id,
      ],
      (updateErr) => {
        if (updateErr) {
          return callback({
            code: grpc.status.INTERNAL,
            message: updateErr.message,
          });
        }

        callback(null, updatedDoctor);
      }
    );
  });
}

function deleteDoctor(call, callback) {
  const { id } = call.request;

  db.run(`DELETE FROM doctors WHERE id = ?`, [id], function (err) {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    if (this.changes === 0) {
      return callback(null, {
        success: false,
        message: 'Doctor not found',
      });
    }

    callback(null, {
      success: true,
      message: 'Doctor deleted successfully',
    });
  });
}

function searchDoctorsBySpecialty(call, callback) {
  const { specialty } = call.request;

  db.all(
    `SELECT * FROM doctors WHERE specialty LIKE ?`,
    [`%${specialty}%`],
    (err, rows) => {
      if (err) {
        return callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      }

      callback(null, { doctors: rows });
    }
  );
}

function checkDoctorAvailability(call, callback) {
  const { doctor_id, date } = call.request;

  if (!doctor_id || !date) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'doctor_id and date are required',
    });
  }

  callback(null, {
    available: true,
    message: 'Doctor availability checked',
  });
}

function main() {
  const server = new grpc.Server();

  server.addService(doctorProto.DoctorService.service, {
    createDoctor,
    getDoctor,
    listDoctors,
    updateDoctor,
    deleteDoctor,
    searchDoctorsBySpecialty,
    checkDoctorAvailability,
  });

  server.bindAsync(
    '0.0.0.0:50052',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Doctor Service error:', err);
        return;
      }

      console.log(`Doctor Service running on port ${port}`);
    }
  );
}

main();