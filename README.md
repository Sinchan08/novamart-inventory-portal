# NovaMart Distributors - Inventory Portal

## Overview
The NovaMart Inventory Portal is an enterprise SAPUI5 application built using the Flexible Column Layout (FCL) architecture. The application provides dynamic stock tracking, property binding, real-time stock updates, custom status formatting, and complete Master-Detail CRUD operations.

## Features
* Master-Detail navigation using `sap.f.FlexibleColumnLayout`.
* Custom status formatting for stock levels (In Stock, Low Stock, Out of Stock).
* Dynamic stock reordering with direct JSON model state updates.
* Unified Add and Edit product dialog fragments with input validation.
* Route error handling via dedicated `NotFound` view and fallback navigation.
* Multi-language support (i18n) for English and German locales.

## Technical Architecture & Application Details
* **App Generator**: SAP Fiori Application Generator
* **Framework**: SAPUI5 (Version 1.150.1)
* **Theme**: `sap_horizon`
* **Namespace**: `novamart.inventory.inventoryportal`
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
1. Prerequisites
Ensure you have Node.js installed on your system. If @ui5/cli is not installed globally, install it:

Bash
npm install -g @ui5/cli
2. Installation
Clone the repository and install dependencies:

Bash
git clone <YOUR_REMOTE_REPOSITORY_URL>
cd inventory-portal
npm install
3. Execution
To launch the application using UI5 Tooling:

Bash
ui5 serve -o index.html
Alternatively, run:

Bash
npm start
Testing & Verification Guidelines
Testing German Localization (i18n_de)
To verify multi-language support in German, append the framework query parameter before the URL hash (#):

German Locale URL:

http://localhost:8080/index.html?sap-ui-language=de

Note: Avoid placing ?sap-ui-language=de after the # symbol (e.g., #?sap-ui-language=de), as hash parameters are interpreted by the UI5 Router as invalid route parameters.

Testing the NotFound Route
To verify route error handling and fallback navigation:

Trigger Invalid Product ID Route:

Navigate to an invalid product key in the hash router:

http://localhost:8080/index.html#/products/INVALID_ID_999

Expected Result:

The application displays the NotFound view with the error message and a "Back to Master List" action button.