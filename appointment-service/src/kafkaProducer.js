const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'appointment-service',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

let isConnected = false;

async function connectProducer() {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log('Appointment Kafka producer connected.');
  }
}

async function sendAppointmentEvent(topic, eventData) {
  try {
    await connectProducer();

    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(eventData),
        },
      ],
    });

    console.log(`Kafka event sent to topic: ${topic}`);
  } catch (error) {
    console.log('Kafka event not sent:', error.message);
  }
}

module.exports = sendAppointmentEvent;