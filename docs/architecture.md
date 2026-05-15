# SmartClinic Architecture

## General Architecture

SmartClinic is a microservices application for clinic management.

The client communicates with the API Gateway using REST and GraphQL over HTTP/1.1 with JSON.

The API Gateway communicates with microservices using gRPC over HTTP/2 with Protobuf.

Kafka is used for asynchronous communication between microservices.

Each microservice has its own database.

## Microservices

### Patient Service

Responsible for managing patients.

Main operations:
- Create patient
- Get patient
- List patients
- Update patient
- Delete patient
- Search patients

Database: SQLite

### Doctor Service

Responsible for managing doctors and specialties.

Main operations:
- Create doctor
- Get doctor
- List doctors
- Update doctor
- Delete doctor
- Search doctors by specialty
- Check doctor availability

Database: SQLite

### Appointment Service

Responsible for managing appointments between patients and doctors.

Main operations:
- Create appointment
- Get appointment
- List appointments
- Update appointment status
- Delete appointment
- List appointments by patient
- List appointments by doctor

Database: SQLite

Kafka producer:
- appointment.created
- appointment.cancelled

### Notification Service

Responsible for storing notifications generated from business events.

Main operations:
- Create notification
- Get notification
- List notifications
- List notifications by patient
- Mark notification as read

Database: RxDB or SQLite

Kafka consumer:
- patient.created
- appointment.created
- appointment.cancelled

## Communication

Client to API Gateway:
- REST
- GraphQL

API Gateway to microservices:
- gRPC
- Protobuf
- HTTP/2

Microservice to microservice:
- Kafka events

## Kafka Topics

- patient.created
- appointment.created
- appointment.cancelled
- notification.created