const {
    patientClient,
    doctorClient,
    appointmentClient,
    notificationClient,
    callGrpc,
  } = require('../grpc/clients');
  
  const resolvers = {
    Query: {
      patients: async () => {
        const result = await callGrpc(patientClient, 'listPatients', {});
        return result.patients || [];
      },
  
      patient: async (_, { id }) => {
        return callGrpc(patientClient, 'getPatient', { id });
      },
  
      searchPatients: async (_, { name }) => {
        const result = await callGrpc(patientClient, 'searchPatients', { name });
        return result.patients || [];
      },
  
      doctors: async () => {
        const result = await callGrpc(doctorClient, 'listDoctors', {});
        return result.doctors || [];
      },
  
      doctor: async (_, { id }) => {
        return callGrpc(doctorClient, 'getDoctor', { id });
      },
  
      doctorsBySpecialty: async (_, { specialty }) => {
        const result = await callGrpc(doctorClient, 'searchDoctorsBySpecialty', {
          specialty,
        });
        return result.doctors || [];
      },
  
      checkDoctorAvailability: async (_, { doctor_id, date }) => {
        return callGrpc(doctorClient, 'checkDoctorAvailability', {
          doctor_id,
          date,
        });
      },
  
      appointments: async () => {
        const result = await callGrpc(appointmentClient, 'listAppointments', {});
        return result.appointments || [];
      },
  
      appointment: async (_, { id }) => {
        return callGrpc(appointmentClient, 'getAppointment', { id });
      },
  
      appointmentsByPatient: async (_, { patient_id }) => {
        const result = await callGrpc(appointmentClient, 'listAppointmentsByPatient', {
          patient_id,
        });
        return result.appointments || [];
      },
  
      appointmentsByDoctor: async (_, { doctor_id }) => {
        const result = await callGrpc(appointmentClient, 'listAppointmentsByDoctor', {
          doctor_id,
        });
        return result.appointments || [];
      },
  
      notifications: async () => {
        const result = await callGrpc(notificationClient, 'listNotifications', {});
        return result.notifications || [];
      },
  
      notification: async (_, { id }) => {
        return callGrpc(notificationClient, 'getNotification', { id });
      },
  
      notificationsByPatient: async (_, { patient_id }) => {
        const result = await callGrpc(notificationClient, 'listNotificationsByPatient', {
          patient_id,
        });
        return result.notifications || [];
      },
    },
  
    Mutation: {
      createPatient: async (_, args) => {
        return callGrpc(patientClient, 'createPatient', args);
      },
  
      updatePatient: async (_, args) => {
        return callGrpc(patientClient, 'updatePatient', args);
      },
  
      deletePatient: async (_, { id }) => {
        return callGrpc(patientClient, 'deletePatient', { id });
      },
  
      createDoctor: async (_, args) => {
        return callGrpc(doctorClient, 'createDoctor', args);
      },
  
      updateDoctor: async (_, args) => {
        return callGrpc(doctorClient, 'updateDoctor', args);
      },
  
      deleteDoctor: async (_, { id }) => {
        return callGrpc(doctorClient, 'deleteDoctor', { id });
      },
  
      createAppointment: async (_, args) => {
        return callGrpc(appointmentClient, 'createAppointment', args);
      },
  
      updateAppointmentStatus: async (_, args) => {
        return callGrpc(appointmentClient, 'updateAppointmentStatus', args);
      },
  
      deleteAppointment: async (_, { id }) => {
        return callGrpc(appointmentClient, 'deleteAppointment', { id });
      },
  
      createNotification: async (_, args) => {
        return callGrpc(notificationClient, 'createNotification', args);
      },
  
      markNotificationAsRead: async (_, { id }) => {
        return callGrpc(notificationClient, 'markNotificationAsRead', { id });
      },
    },
  };
  
  module.exports = resolvers;