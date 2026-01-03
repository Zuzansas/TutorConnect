# TutorConnect

TutorConnect is a full-stack application designed to connect tutors and students.  
This repository currently contains the backend part of the project.

---

## Running the Project (Backend)

### Requirements
- Java 17
- Maven Wrapper (`mvnw`)

### Running the Backend

To start the backend application, use the Maven Wrapper:

```bash
./mvnw spring-boot:run
```
After a successful startup, the application will be available at:

```bash
http://localhost:8080
```

### API Documentation (Swagger)
The REST API documentation is available via Swagger UI:

```bash
http://localhost:8080/swagger-ui/index.html#/
```

Swagger allows you to explore and test available endpoints directly from the browser.


### Authentication & Authorization

To access secured endpoints, you must obtain authorization tokens.

You can do this by:

- logging in with an existing user, or

- registering a new user

After a successful login or registration, the backend returns:

- Access Token – used to authorize API requests

- Refresh Token – used to refresh the access token


### Technologies
- Java 17

- Spring Boot

- Maven

- Swagger / OpenAPI

