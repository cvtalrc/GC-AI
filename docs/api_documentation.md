# GC-AI API Documentation

## Introduction
The GC-AI API provides key functionalities for managing biological components, generating SBOL3 files, format conversion, and image processing. This documentation outlines the available endpoints, their parameters, expected responses, and potential errors.

---

## 1. Component Endpoints

### 1.1 Get Component Names
- **Path:** `/names`
- **Method:** `GET`
- **Description:** Returns a list of part names based on a specific role.

#### Parameters:
- `role` (required): Role of the component (e.g., Promoter, CDS).

#### Request Example:
```bash
GET /names?role=Promoter
```

#### Responses:
- `200 OK`: List of component names.
- `400 Bad Request`: If the `role` parameter is missing or invalid.
- `500 Internal Server Error`: Database query error.

---

### 1.2 Get Interaction Participations
- **Path:** `/interactions`
- **Method:** `GET`
- **Description:** Returns participation types for a specific interaction type.

#### Parameters:
- `interaction_type` (required): Type of interaction (e.g., Inhibition, Stimulation).

#### Request Example:
```bash
GET /interactions?interaction_type=Inhibition
```

#### Responses:
- `200 OK`: List of participation types.
- `400 Bad Request`: If the `interaction_type` parameter is missing or invalid.
- `500 Internal Server Error`: Internal error.

---

### 1.3 Get Component Details
- **Path:** `/details`
- **Method:** `GET`
- **Description:** Returns details of a component based on its name.

#### Parameters:
- `component_name` (required): Name of the component.
- `role` (optional): Role associated with the component.

#### Request Example:
```bash
GET /details?component_name=BBa_R0010
```

#### Responses:
- `200 OK`: Component details.
- `404 Not Found`: If the component is not found.
- `500 Internal Server Error`: Internal error.

---

## 2. File Endpoints

### 2.1 Generate SBOL3 File
- **Path:** `/create`
- **Method:** `POST`
- **Description:** Generates validated SBOL3 files.

#### Body:
```json
{
  "data": {
    "namespace": "http://example.org",
    "components": [...]
  }
}
```

#### Request Example:
```bash
POST /create
```

#### Responses:
- `200 OK`: Returns the generated file.
- `400 Bad Request`: If the provided data is invalid.
- `500 Internal Server Error`: Error generating or validating the file.

---

### 2.2 Convert SBOL3 Files
- **Path:** `/convert`
- **Method:** `POST`
- **Description:** Converts SBOL3 files to GenBank and/or FASTA formats.

#### Body:
```json
{
  "file_path": "/path/to/sbol3/file",
  "genbank": true,
  "fasta": true
}
```

#### Request Example:
```bash
POST /convert
```

#### Responses:
- `200 OK`: Returns a ZIP file with the converted formats.
- `404 Not Found`: If the file does not exist.
- `500 Internal Server Error`: Error during conversion.

---

## 3. Inference Endpoints

### 3.1 Process Image
- **Path:** `/`
- **Method:** `POST`
- **Description:** Processes an image and returns predictions.

#### Body:
Image file in the `image` field.

#### Request Example:
```bash
POST /
Content-Type: multipart/form-data
Form-Data: { image: <file> }
```

#### Responses:
- `200 OK`: Successful predictions.
- `400 Bad Request`: If a valid file is not provided.
- `500 Internal Server Error`: Error during processing.

---

## 4. Health Endpoints

### 4.1 Healthcheck
- **Path:** `/`
- **Method:** `GET`
- **Description:** Verifies the status of the application and its services.

#### Responses:
- `200 OK`: The application is functioning correctly.
- `500 Internal Server Error`: Some service is unavailable.

---

## Contribution
If you wish to contribute to the development of this API, please open an issue or submit a pull request in the corresponding repository. Be sure to follow the contribution guidelines.




