const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');

const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const app = express();
const port = 3000;

async function startServer() {
  app.use(cors());
  app.use(express.json());

  const graphqlServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await graphqlServer.start();

  app.use('/graphql', expressMiddleware(graphqlServer));

  app.get('/', (req, res) => {
    res.json({
      message: 'SmartClinic API Gateway',
      rest: {
        patients: '/patients',
        doctors: '/doctors',
        appointments: '/appointments',
        notifications: '/notifications',
      },
      graphql: '/graphql',
    });
  });

  app.use('/patients', patientRoutes);
  app.use('/doctors', doctorRoutes);
  app.use('/appointments', appointmentRoutes);
  app.use('/notifications', notificationRoutes);

  app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
    console.log(`GraphQL ready on http://localhost:${port}/graphql`);
  });
}

startServer();