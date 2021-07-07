# ZIP Code API

A toy REST API for managing a list of ZIP codes.

## **Getting Started**

### Requirements

- [Node.js 14.6.0+](https://nodejs.org/en/)

### Installation Instructions

1. Install the package:

    `yarn install` OR `npm install`

## **Usage**

1. Start the server:

    `yarn start` OR `npx start`

2. Wait for the following notification in the console:

    ```API is live and listening at: http://localhost:${portNumber}```

3. Note the `portNumber` given in your notification.
4. Invoke the API with `portNumber` using the provided client scripts:

    - `yarn insert -p ${portNumber} -z ${zipCode0},${zipCode1},...,${zipCodeN}`
    - `yarn delete -p ${portNumber} -z ${zipCode0},${zipCode1},...,${zipCodeN}`
    - `yarn has -p ${portNumber} -z ${zipCode0},${zipCode1},...,${zipCodeN}`
    - `yarn display -p ${portNumber}`

5. Alternatively, call the API directly via http (the following commands assume [HTTPie](https://httpie.io/) is installed):

    - INSERT: `http PUT http://localhost:${portNumber}/api/v1/zip-codes/${zipCode}`
    - DELETE: `http DELETE http://localhost:${portNumber}/api/v1/zip-codes/${zipCode}`
    - HAS: `http GET http://localhost:${portNumber}/api/v1/zip-codes/${zipCode}`
    - DISPLAY: `http GET http://localhost:${portNumber}/api/v1/zip-codes`

## **API Reference**

### **INSERT**

- Method: **PUT**
- Path: `/api/v1/zip-codes/:zip-code`
- Parameters:
  - `:zip-code` – 5 digit ZIP code to insert
- Success Responses:
  - 201 Created – the ZIP code was new and has been inserted
  - 200 OK – the ZIP code was already in the list
- Errors:
  - 400 Bad Request – invalid ZIP code

### **DELETE**

- Method: **DELETE**
- Path: `/api/v1/zip-codes/:zip-code`
- Parameters:
  - `:zip-code` – 5 digit ZIP code to insert
- Success Responses:
  - 204 No Content – the ZIP code was successfully deleted
- Errors:
  - 400 Bad Request – invalid ZIP code
  - 404 Not Found – the ZIP code was not in the list

### **HAS**

- Method: **GET** or **HEAD**
- Path: `/api/v1/zip-codes/:zip-code`
- Parameters:
  - `:zip-code` – 5 digit ZIP code to insert
- Success Responses:
  - 200 OK – the ZIP code is present, request body contains the ZIP code in plain text if the method is GET
- Errors:
  - 400 Bad Request – invalid ZIP code
  - 404 Not Found – the ZIP code was not in the list
- **IMPORTANT NOTE**: 404 is the negative case response of the HAS operation. Clients must expect and handle this response appropriately.

### **DISPLAY**

- Method: **GET**
- Path: `/api/v1/zip-codes`
- Success Responses:
  - 200 OK – request body contains the list of ZIP codes in plain text
