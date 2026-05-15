const typeDefs = `#graphql
  type Patient {
    id: ID!
    full_name: String!
    email: String!
    phone: String!
    birth_date: String
    created_at: String
  }

  type Doctor {
    id: ID!
    full_name: String!
    specialty: String!
    email: String!
    phone: String!
    created_at: String
  }

  type Appointment {
    id: ID!
    patient_id: ID!
    doctor_id: ID!
    date: String!
    reason: String
    status: String!
    created_at: String
  }

  type Notification {
    id: ID!
    patient_id: ID!
    type: String!
    message: String!
    is_read: Boolean!
    created_at: String!
  }

  type DeleteResponse {
    success: Boolean!
    message: String!
  }

  type AvailabilityResponse {
    available: Boolean!
    message: String!
  }

  type Query {
    patients: [Patient]
    patient(id: ID!): Patient
    searchPatients(name: String!): [Patient]

    doctors: [Doctor]
    doctor(id: ID!): Doctor
    doctorsBySpecialty(specialty: String!): [Doctor]
    checkDoctorAvailability(doctor_id: ID!, date: String!): AvailabilityResponse

    appointments: [Appointment]
    appointment(id: ID!): Appointment
    appointmentsByPatient(patient_id: ID!): [Appointment]
    appointmentsByDoctor(doctor_id: ID!): [Appointment]

    notifications: [Notification]
    notification(id: ID!): Notification
    notificationsByPatient(patient_id: ID!): [Notification]
  }

  type Mutation {
    createPatient(
      full_name: String!
      email: String!
      phone: String!
      birth_date: String
    ): Patient

    updatePatient(
      id: ID!
      full_name: String
      email: String
      phone: String
      birth_date: String
    ): Patient

    deletePatient(id: ID!): DeleteResponse

    createDoctor(
      full_name: String!
      specialty: String!
      email: String!
      phone: String!
    ): Doctor

    updateDoctor(
      id: ID!
      full_name: String
      specialty: String
      email: String
      phone: String
    ): Doctor

    deleteDoctor(id: ID!): DeleteResponse

    createAppointment(
      patient_id: ID!
      doctor_id: ID!
      date: String!
      reason: String
    ): Appointment

    updateAppointmentStatus(
      id: ID!
      status: String!
    ): Appointment

    deleteAppointment(id: ID!): DeleteResponse

    createNotification(
      patient_id: ID!
      type: String!
      message: String!
    ): Notification

    markNotificationAsRead(id: ID!): Notification
  }
`;

module.exports = typeDefs;