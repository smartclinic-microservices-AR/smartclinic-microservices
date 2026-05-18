# SmartClinic Microservices

SmartClinic is a small clinic management app built with Node.js microservices.
The goal is to keep every part separated: patients, doctors, appointments and notifications.
The API Gateway is the only entry point for the client. It exposes REST and GraphQL, then it calls the services with gRPC.
Kafka is used for automatic notification events.

## 1. Main technologies

- Node.js
- Express.js
- gRPC + Protocol Buffers
- GraphQL with Apollo Server
- Kafka
- Docker Compose
- SQLite databases
- Postman for tests

## 2. Project structure

```text
smartclinic-microservices/
  api-gateway/
  patient-service/
  doctor-service/
  appointment-service/
  notification-service/
  proto/
  docs/
  postman/
  docker-compose.yml
  README.md
```

## 3. Architecture

```text
Client / Postman
       |
       | REST or GraphQL
       v
API Gateway :3000
       |
       | gRPC
       v
+---------------------+       Kafka events       +------------------------+
| patient-service     |  --------------------->  | notification-service   |
| port 50051          |  patient.created         | port 50054             |
+---------------------+                          +------------------------+

+---------------------+       Kafka events       +------------------------+
| appointment-service |  --------------------->  | notification-service   |
| port 50053          |  appointment.created     | saves notifications    |
|                     |  appointment.cancelled   | in SQLite              |
+---------------------+                          +------------------------+

+---------------------+
| doctor-service      |
| port 50052          |
+---------------------+

Kafka broker: localhost:9092
```

The API Gateway does not contain the main business logic. It only receives the client requests and forwards them to the right microservice using gRPC.

## 4. Services

| Service | Port | Role | Database |
|---|---:|---|---|
| API Gateway | 3000 | REST and GraphQL entry point | none |
| Patient service | 50051 | Manage patients | SQLite |
| Doctor service | 50052 | Manage doctors and availability | SQLite |
| Appointment service | 50053 | Manage appointments | SQLite |
| Notification service | 50054 | Manage notifications and consume Kafka events | SQLite |
| Kafka broker | 9092 | Async communication | none |

## 5. gRPC and proto files

The `.proto` files are inside the `proto/` folder:

```text
proto/patient.proto
proto/doctor.proto
proto/appointment.proto
proto/notification.proto
```

Each microservice loads its own proto file and exposes a gRPC server.
The API Gateway creates gRPC clients and calls the microservices from REST routes and GraphQL resolvers.

## 6. Kafka events

Kafka is used only for real business events that should trigger notifications.

| Topic | Producer | Consumer | When it is sent | Message content |
|---|---|---|---|---|
| `patient.created` | patient-service | notification-service | When a patient profile is created | patient id, name, email, phone, birth date, created date |
| `appointment.created` | appointment-service | notification-service | When an appointment is created | appointment id, patient id, doctor id, date, reason, status |
| `appointment.cancelled` | appointment-service | notification-service | When an appointment status becomes `CANCELLED` | appointment id, patient id, doctor id, date, status |

The notification service consumes these topics and saves the generated notifications in its SQLite database.

## 7. Installation

Requirements:

- Node.js installed
- Docker Desktop installed and running
- Postman installed for testing

Clone the repository:

```bash
git clone https://github.com/smartclinic-microservices-AR/smartclinic-microservices.git
cd smartclinic-microservices
```

Start Kafka:

```bash
docker compose up -d
```

Check that Kafka is running:

```bash
docker ps
```

Install dependencies in each service:

```bash
cd patient-service
npm install
cd ..

cd doctor-service
npm install
cd ..

cd appointment-service
npm install
cd ..

cd notification-service
npm install
cd ..

cd api-gateway
npm install
cd ..
```

## 8. Run the project

Open separate terminals.

Terminal 1:

```bash
cd patient-service
npm start
```

Terminal 2:

```bash
cd doctor-service
npm start
```

Terminal 3:

```bash
cd appointment-service
npm start
```

Terminal 4:

```bash
cd notification-service
npm start
```

Terminal 5:

```bash
cd api-gateway
npm start
```

Expected ports:

```text
API Gateway running on port 3000
Patient Service running on port 50051
Doctor Service running on port 50052
Appointment Service running on port 50053
Notification Service running on port 50054
Kafka running on port 9092
```

## 9. REST endpoints

Base URL:

```text
http://localhost:3000
```

### Patients

| Method | Endpoint | Description |
|---|---|---|
| POST | `/patients` | Create patient |
| GET | `/patients` | List patients |
| GET | `/patients/search?name=Test` | Search patients by name |
| GET | `/patients/:id` | Get patient by id |
| PUT | `/patients/:id` | Update patient |
| DELETE | `/patients/:id` | Delete patient |

Example create patient:

```json
{
  "full_name": "Test Patient",
  "email": "test.patient@gmail.com",
  "phone": "12345678",
  "birth_date": "2000-01-01"
}
```

### Doctors

| Method | Endpoint | Description |
|---|---|---|
| POST | `/doctors` | Create doctor |
| GET | `/doctors` | List doctors |
| GET | `/doctors/search?specialty=Cardiology` | Search doctors by specialty |
| GET | `/doctors/:id` | Get doctor by id |
| PUT | `/doctors/:id` | Update doctor |
| DELETE | `/doctors/:id` | Delete doctor |
| GET | `/doctors/:id/availability?date=2026-05-20` | Check doctor availability |

Example create doctor:

```json
{
  "full_name": "Dr. Sara Ben Ali",
  "specialty": "Cardiology",
  "email": "sara.doctor@gmail.com",
  "phone": "22334455"
}
```

### Appointments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/appointments` | Create appointment |
| GET | `/appointments` | List appointments |
| GET | `/appointments/:id` | Get appointment by id |
| GET | `/appointments/patient/:patientId` | List appointments by patient |
| GET | `/appointments/doctor/:doctorId` | List appointments by doctor |
| PUT | `/appointments/:id/status` | Update appointment status |
| DELETE | `/appointments/:id` | Delete appointment |

Example create appointment:

```json
{
  "patient_id": "PASTE_PATIENT_ID",
  "doctor_id": "PASTE_DOCTOR_ID",
  "date": "2026-05-20",
  "reason": "General check"
}
```

Example cancel appointment:

```json
{
  "status": "CANCELLED"
}
```

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| POST | `/notifications` | Create notification manually |
| GET | `/notifications` | List notifications |
| GET | `/notifications/:id` | Get notification by id |
| GET | `/notifications/patient/:patientId` | List notifications by patient |
| PUT | `/notifications/:id/read` | Mark notification as read |

## 10. GraphQL

GraphQL URL:

```text
http://localhost:3000/graphql
```

Example query:

```graphql
query {
  patients {
    id
    full_name
    email
    phone
  }
}
```

Example mutation:

```graphql
mutation {
  createPatient(
    full_name: "GraphQL Patient"
    email: "graphql.patient@gmail.com"
    phone: "99999999"
    birth_date: "2001-01-01"
  ) {
    id
    full_name
    email
  }
}
```

Example appointment query:

```graphql
query {
  appointments {
    id
    patient_id
    doctor_id
    date
    status
  }
}
```

## 11. Main test scenario

1. Start Kafka with Docker Compose.
2. Start all microservices.
3. Start the API Gateway.
4. Create a patient using REST or GraphQL.
5. The patient service sends `patient.created` to Kafka.
6. The notification service consumes the event and creates a welcome notification.
7. Create an appointment.
8. The appointment service sends `appointment.created` to Kafka.
9. The notification service creates an appointment notification.
10. Cancel the appointment with `PUT /appointments/:id/status`.
11. The appointment service sends `appointment.cancelled` to Kafka.
12. The notification service creates a cancellation notification.

Expected logs:

```text
Patient Kafka producer connected.
Kafka event sent to topic: patient.created

Appointment Kafka producer connected.
Kafka event sent to topic: appointment.created
Kafka event sent to topic: appointment.cancelled

Notification Kafka consumer started.
Notification saved: Welcome Test Patient, your patient profile was created.
Notification saved: Your appointment was created for 2026-05-20.
Notification saved: Your appointment <id> was cancelled.
```

## 12. Stop the project

Stop Node services with:

```text
CTRL + C
```

Stop Kafka:

```bash
docker compose down
```

## 13. Notes

- `node_modules/` is ignored and should not be pushed.
- SQLite database files are ignored because they are generated locally.
- Kafka topics used in the project are `patient.created`, `appointment.created` and `appointment.cancelled`.
- The Postman collection can be used to test REST and GraphQL requests.
