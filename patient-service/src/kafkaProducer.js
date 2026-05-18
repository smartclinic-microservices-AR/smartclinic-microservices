const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'patient-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();
let isConnected = false;

async function connectProducer() {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log('Patient Kafka producer connected.');
  }
}

async function sendPatientEvent(topic, eventData) {
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

module.exports = sendPatientEvent;