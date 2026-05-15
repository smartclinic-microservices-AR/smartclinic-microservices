const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

function loadProto(protoFile, packageName) {
  const protoPath = path.join(__dirname, '../../../proto', protoFile);

  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  return grpc.loadPackageDefinition(packageDefinition)[packageName];
}

const patientProto = loadProto('patient.proto', 'patient');
const doctorProto = loadProto('doctor.proto', 'doctor');
const appointmentProto = loadProto('appointment.proto', 'appointment');
const notificationProto = loadProto('notification.proto', 'notification');

const patientClient = new patientProto.PatientService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

const doctorClient = new doctorProto.DoctorService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

const appointmentClient = new appointmentProto.AppointmentService(
  'localhost:50053',
  grpc.credentials.createInsecure()
);

const notificationClient = new notificationProto.NotificationService(
  'localhost:50054',
  grpc.credentials.createInsecure()
);

function callGrpc(client, method, payload = {}) {
  return new Promise((resolve, reject) => {
    client[method](payload, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}

module.exports = {
  patientClient,
  doctorClient,
  appointmentClient,
  notificationClient,
  callGrpc,
};