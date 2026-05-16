\# SmartClinic Microservices



SmartClinic is a Node.js microservices project for clinic management.



\## Architecture



The client communicates with the API Gateway using REST and GraphQL over HTTP/1.1 with JSON.



The API Gateway communicates with the microservices using gRPC over HTTP/2 with Protobuf.



Kafka is used for asynchronous communication between services, especially for appointment and notification events.



\## Microservices



1\. Patient Service

2\. Doctor Service

3\. Appointment Service

4\. Notification Service



\## Technologies



\- Node.js

\- Express.js

\- gRPC

\- Protobuf

\- GraphQL

\- Apollo Server

\- KafkaJS

\- SQLite

\- Postman

\- GitHub



\## Ports



| Service | Port |

|---|---|

| Patient Service | 50051 |

| Doctor Service | 50052 |

| Appointment Service | 50053 |

| Notification Service | 50054 |

| API Gateway | 3000 |



\## Project Structure



```txt

smartclinic-microservices/

├── api-gateway/

├── patient-service/

├── doctor-service/

├── appointment-service/

├── notification-service/

├── proto/

├── docs/

├── postman/

└── README.md

