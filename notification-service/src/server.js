const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const startKafkaConsumer = require('./kafkaConsumer');

const PROTO_PATH = path.join(__dirname, '../../proto/notification.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const notificationProto = grpc.loadPackageDefinition(packageDefinition).notification;

function createNotification(call, callback) {
  const { patient_id, type, message } = call.request;

  if (!patient_id || !type || !message) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'patient_id, type and message are required',
    });
  }

  const notification = {
    id: uuidv4(),
    patient_id,
    type,
    message,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  db.run(
    `INSERT INTO notifications (id, patient_id, type, message, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      notification.id,
      notification.patient_id,
      notification.type,
      notification.message,
      0,
      notification.created_at,
    ],
    (err) => {
      if (err) {
        return callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      }

      callback(null, notification);
    }
  );
}

function getNotification(call, callback) {
  const { id } = call.request;

  db.get(`SELECT * FROM notifications WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    if (!row) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Notification not found',
      });
    }

    callback(null, {
      ...row,
      is_read: Boolean(row.is_read),
    });
  });
}

function listNotifications(call, callback) {
  db.all(`SELECT * FROM notifications`, [], (err, rows) => {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    callback(null, {
      notifications: rows.map((row) => ({
        ...row,
        is_read: Boolean(row.is_read),
      })),
    });
  });
}

function listNotificationsByPatient(call, callback) {
  const { patient_id } = call.request;

  db.all(
    `SELECT * FROM notifications WHERE patient_id = ?`,
    [patient_id],
    (err, rows) => {
      if (err) {
        return callback({
          code: grpc.status.INTERNAL,
          message: err.message,
        });
      }

      callback(null, {
        notifications: rows.map((row) => ({
          ...row,
          is_read: Boolean(row.is_read),
        })),
      });
    }
  );
}

function markNotificationAsRead(call, callback) {
  const { id } = call.request;

  db.get(`SELECT * FROM notifications WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }

    if (!row) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Notification not found',
      });
    }

    db.run(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id], (updateErr) => {
      if (updateErr) {
        return callback({
          code: grpc.status.INTERNAL,
          message: updateErr.message,
        });
      }

      callback(null, {
        ...row,
        is_read: true,
      });
    });
  });
}

function main() {
  const server = new grpc.Server();

  server.addService(notificationProto.NotificationService.service, {
    createNotification,
    getNotification,
    listNotifications,
    listNotificationsByPatient,
    markNotificationAsRead,
  });

  server.bindAsync(
    '0.0.0.0:50054',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Notification Service error:', err);
        return;
      }

      console.log(`Notification Service running on port ${port}`);
      startKafkaConsumer();
    }
  );
}

main();