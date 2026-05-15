const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

function saveNotification(patientId, type, message) {
  const notification = {
    id: uuidv4(),
    patient_id: patientId,
    type,
    message,
    is_read: 0,
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
      notification.is_read,
      notification.created_at,
    ],
    (err) => {
      if (err) {
        console.error('Error saving notification:', err.message);
      } else {
        console.log('Notification saved:', notification.message);
      }
    }
  );
}

async function startKafkaConsumer() {
  try {
    await consumer.connect();

    await consumer.subscribe({ topic: 'patient.created', fromBeginning: true });
    await consumer.subscribe({ topic: 'appointment.created', fromBeginning: true });
    await consumer.subscribe({ topic: 'appointment.cancelled', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const data = JSON.parse(message.value.toString());

        if (topic === 'patient.created') {
          saveNotification(
            data.patient_id,
            'PATIENT_CREATED',
            `Welcome ${data.full_name}, your patient profile was created.`
          );
        }

        if (topic === 'appointment.created') {
          saveNotification(
            data.patient_id,
            'APPOINTMENT_CREATED',
            `Your appointment was created for ${data.date}.`
          );
        }

        if (topic === 'appointment.cancelled') {
          saveNotification(
            data.patient_id,
            'APPOINTMENT_CANCELLED',
            `Your appointment ${data.appointment_id} was cancelled.`
          );
        }
      },
    });

    console.log('Notification Kafka consumer started.');
  } catch (error) {
    console.log('Kafka consumer not started:', error.message);
  }
}

module.exports = startKafkaConsumer;