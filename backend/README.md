# GC-AI

**GC-AI** is a web application designed for symbol detection and SBOL3 file generation. The backend provides APIs for image processing, file generation, and data interaction.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [License](#license)

---

## Features

- **Symbol Detection**: Leverages a trained ML model to identify and classify symbols in input images.
- **SBOL3 File Generation**: Creates SBOL3 files based on user input and system rules.
- **File Conversion**: Converts SBOL3 files to GenBank and/or FASTA formats.
- **Health Check**: Provides an endpoint to verify the application's health.
- **Database Integration**: Interacts with a MySQL database to retrieve and store relevant data.

---

## Installation with Docker

This project uses Docker to create a development environment that includes three services: **Backend**, **Frontend**, and **Database (MySQL)**. We use Docker Compose to orchestrate the containers.

## Prerequisites

Before you begin, ensure that you have the following programs installed on your machine:

- [Docker](https://www.docker.com/products/docker-desktop) (and Docker Compose)
- [Git](https://git-scm.com/)

## Installation

Follow these steps to install and run the project locally:

### 1. **Clone the repository:**

   First, clone the repository to your local machine:

   ```bash
   git clone <https://github.com/cvtalrc/GG-AI.git>
   cd <GG-AI>
   ```

### 2. **Configure the `.env` file:**

   The project uses a `.env` file to store the environment variables needed for the database and the application. Create a `.env` file at the root of the project and configure the following variables:

   ```bash
   touch .env
   ```

   Edit the `.env` file with the appropriate values:

   ```env
   # Database
   DB_HOST=mysql_db
   DB_USER=youruser
   DB_PASSWORD=yourpassword
   DB_NAME=iGEM2024
   DB_PORT=3306

   # Application
   APP_HOST='0.0.0.0'
   APP_PORT=5000

   # Vite base URL
   VITE_API_BASE_URL=http://localhost:5000
   ```

### 3. **Build the Docker containers:**

   Next, build the containers using Docker Compose:

   ```bash
   docker-compose build
   ```

   This command will download the required images and build the containers for the backend, frontend, and database.

### 4. **Start the services:**

   Once the containers are built, you can start the services with the following command:

   ```bash
   docker-compose up
   ```

   This command will start the Docker containers and the services defined in the `docker-compose.yml` file. The services will be available on the following ports:

   - **Backend**: `http://localhost:5000`
   - **Frontend**: `http://localhost:80`

   The MySQL database will be accessible through the `mysql_db` container on port `3307`.

### 5. **Access the application:**

   Once the containers are up and running, you can access the application at the following links:

   - **Frontend**: `http://localhost:80`
   - **Backend**: `http://localhost:5000`

   The MySQL database can be accessed through the container or using tools like `MySQL Workbench`, configuring the connection with:

   - **Host**: `localhost`
   - **Port**: `3307`
   - **User**: <DB_USER> (as defined in .env)
   - **Password**: <DB_PASSWORD> (as defined in .env)

## API Endpoints

### 1. Component Endpoints

#### 1.1 Get Component Names
- **Path:** `/names`
- **Method:** `GET`
- **Description:** Returns a list of part names based on a specific role.

#### 1.2 Get Interaction Participations
- **Path:** `/interactions`
- **Method:** `GET`
- **Description:** Returns participation types for a specific interaction type.

#### 1.3 Get Component Details
- **Path:** `/details`
- **Method:** `GET`
- **Description:** Returns details of a component based on its name.

---

### 2. File Endpoints

#### 2.1 Generate SBOL3 File
- **Path:** `/create`
- **Method:** `POST`
- **Description:** Generates validated SBOL3 files.

#### 2.2 Convert SBOL3 Files
- **Path:** `/convert`
- **Method:** `POST`
- **Description:** Converts SBOL3 files to GenBank and/or FASTA formats.

---

### 3. Inference Endpoints

#### 3.1 Process Image
- **Path:** `/`
- **Method:** `POST`
- **Description:** Processes an image and returns predictions.

---

### 4. Health Endpoints

#### 4.1 Healthcheck
- **Path:** `/`
- **Method:** `GET`
- **Description:** Checks the application's health and its services.

---

## Project Structure

- **`app/`**: Contains the main application code, including subdirectories:
  - **`data_configs/`**: Configuration files for data management.
  - **`files_converted/`**: Stores converted files.
  - **`files_generated/`**: Stores generated files like SBOL3 outputs.
  - **`models/`**: Machine learning models and related files.
  - **`routes/`**: API route definitions.
  - **`utils/`**: Utility scripts for backend operations.
- **`run.py`**: Entry point for the backend.
- **`requirements.txt`**: Lists all dependencies.
- **`gc-ai-backend.log`**: Log file for backend operations.

---

## Documentation

For a detailed API reference, user guide, and additional resources, visit the `docs` folder in this repository. This folder includes:

- **API Documentation:** Detailed explanations of each endpoint, including parameters, request examples, and responses.
- **User Guide:** Step-by-step instructions on how to use the application.
- **Examples Folder:** Contains example files and use cases to better understand the functionality.
- **Video Tutorial:** A video walkthrough demonstrating the application's workflow and features.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.