# NovaMart Distributors - Inventory Portal

## Overview
The NovaMart Inventory Portal is an enterprise SAPUI5 application built using the Flexible Column Layout (FCL) architecture. The application provides dynamic stock tracking, property binding, real-time stock updates, custom status formatting, and complete Master-Detail CRUD operations.

## Features
* Master-Detail navigation using `sap.f.FlexibleColumnLayout`.
* Custom status formatting for stock levels (In Stock, Low Stock, Out of Stock).
* Dynamic stock reordering with direct JSON model state updates.
* Edit and Delete product dialog fragments with input validation.
* Route error handling via dedicated `NotFound` view and fallback navigation.
* Multi-language support using `i18n` property files.

## Technical Architecture & Application Details
* **App Generator**: SAP Fiori Application Generator
* **Framework**: SAPUI5 (Version 1.150.1)
* **Theme**: `sap_horizon`
* **Namespace**: `novamart.inventory`
* **Module Name**: `inventory-portal`
* **Layout**: Flexible Column Layout (`FCL`)
* **Data Handling**: `JSONModel` with custom product records (`products.json`)

## Project Structure
```text
inventory-portal/
├── webapp/
│   ├── controller/
│   │   ├── App.controller.js
│   │   ├── BaseController.js
│   │   ├── List.controller.js
│   │   ├── Detail.controller.js
│   │   └── NotFound.controller.js
│   ├── fragment/
│   │   ├── AddEditProduct.fragment.xml
│   │   └── ViewSettings.fragment.xml
│   ├── model/
│   │   ├── formatter.js
│   │   ├── models.js
│   │   └── products.json
│   ├── view/
│   │   ├── App.view.xml
│   │   ├── List.view.xml
│   │   ├── Detail.view.xml
│   │   └── NotFound.view.xml
│   ├── i18n/
│   │   ├── i18n.properties
│   │   └── i18n_de.properties
│   ├── Component.js
│   ├── manifest.json
│   └── index.html
├── .gitignore
├── package.json
└── README.md

Setup and Execution Instructions
Clone the repository:

Bash
git clone <YOUR_REMOTE_REPOSITORY_URL>
cd inventory-portal
Install dependencies:

Bash
npm install
Run the application locally:

Bash
npm start
Access the application in the browser:
http://localhost:8080/index.html