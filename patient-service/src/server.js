const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { v4: uuidv4 } = require("uuid");
const db = require("./db");
const sendPatientEvent = require("./kafkaProducer");

const PROTO_PATH = path.join(__dirname, "../../proto/patient.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const patientProto = grpc.loadPackageDefinition(packageDefinition).patient;

function createPatient(call, callback) {
  const { full_name, email, phone, birth_date } = call.request;

  if (!full_name || !email || !phone) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "full_name, email and phone are required",
    });
  }

  const patient = {
    id: uuidv4(),
    full_name,
    email,
    phone,
    birth_date: birth_date || "",
    created_at: new Date().toISOString(),
  };

  db.run(
    `INSERT INTO patients (id, full_name, email, phone, birth_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      patient.id,
      patient.full_name,
      patient.email,
      patient.phone,
      patient.birth_date,
      patient.created_at,
    ],
    (err) => {
      if (err) {
        return callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      }

      sendPatientEvent("patient.created", {
        patient_id: patient.id,
        full_name: patient.full_name,
        email: patient.email,
        phone: patient.phone,
        birth_date: patient.birth_date,
        created_at: patient.created_at,
      });

      callback(null, patient);
    }
  );
}

function getPatient(call, callback) {
  const { id } = call.request;

  db.get(`SELECT * FROM patients WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    if (!row) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Patient not found",
      });
    }

    callback(null, row);
  });
}

function listPatients(call, callback) {
  db.all(`SELECT * FROM patients`, [], (err, rows) => {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    callback(null, { patients: rows });
  });
}

function updatePatient(call, callback) {
  const { id, full_name, email, phone, birth_date } = call.request;

  db.get(`SELECT * FROM patients WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    if (!row) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Patient not found",
      });
    }

    const updatedPatient = {
      id,
      full_name: full_name || row.full_name,
      email: email || row.email,
      phone: phone || row.phone,
      birth_date: birth_date || row.birth_date,
      created_at: row.created_at,
    };

    db.run(
      `UPDATE patients 
       SET full_name = ?, email = ?, phone = ?, birth_date = ?
       WHERE id = ?`,
      [
        updatedPatient.full_name,
        updatedPatient.email,
        updatedPatient.phone,
        updatedPatient.birth_date,
        id,
      ],
      (updateErr) => {
        if (updateErr) {
          return callback({
            code: grpc.status.INTERNAL,
            message: updateErr.message,
          });
        }

        callback(null, updatedPatient);
      }
    );
  });
}

function deletePatient(call, callback) {
  const { id } = call.request;

  db.run(`DELETE FROM patients WHERE id = ?`, [id], function (err) {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    if (this.changes === 0) {
      return callback(null, {
        success: false,
        message: "Patient not found",
      });
    }

    callback(null, {
      success: true,
      message: "Patient deleted successfully",
    });
  });
}

function searchPatients(call, callback) {
  const { name } = call.request;

  db.all(
    `SELECT * FROM patients WHERE full_name LIKE ?`,
    [`%${name}%`],
    (err, rows) => {
      if (err) {
        return callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      }

      callback(null, { patients: rows });
    }
  );
}

function main() {
  const server = new grpc.Server();

  server.addService(patientProto.PatientService.service, {
    createPatient,
    getPatient,
    listPatients,
    updatePatient,
    deletePatient,
    searchPatients,
  });

  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Patient Service error:", err);
        return;
      }

      console.log(`Patient Service running on port ${port}`);
    }
  );
}

main();
