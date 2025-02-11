# Natours Project

## Description

Natours is a full-stack Node.js application for managing and booking tours. The project follows the MVC pattern and includes authentication, authorization, and secure API development.

## Features

- User authentication (signup, login, password reset)
- Secure API with JWT authentication
- Tour management (CRUD operations)
- Review system
- Image upload and processing
- Secure headers and data sanitization

## Project Structure

```
├── controllers/       # Handles business logic
├── models/            # Defines MongoDB schemas
├── routes/            # API routes
├── utilities/         # Helper functions
├── public/            # Static files (CSS, JS, images)
├── views/             # Templating engine views (Pug)
├── config.env         # Environment variables
├── server.js          # Main server file
├── app.js             # Express application setup
└── package.json       # Project dependencies
```

## Setup Instructions

### Prerequisites

- Install [Node.js](https://nodejs.org/) (v10 or higher)
- Install [MongoDB](https://www.mongodb.com/try/download/community)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/adinathyadav2002/Natours.git
   cd Natours
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `config.env` file in the root directory and add the following:
   ```sh
   NODE_ENV=development
   USERNAME=adinath
   DATABASE=<databaselink>
   DATABASEPASS=<password>
   PORT=<port>
   JWT_SECRET=my-own-screte-string-is-very-long-lo
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   EMAIL_USERNAME=<username> from mailtrap
   EMAIL_PASSWORD=<password> from mailtrap
   EMAIL_HOST=<host> from mailtrap
   EMAIL_PORT=<port> (usually 25)
   EMAIL_FROM=<your email>
   SENDGRID_USERNAME=<username> from sendgrid
   SENDGRID_PASSWORD=<password> from sendgrid
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```
5. Start the production server:
   ```sh
   npm start
   ```

## Deployment

**🔗 [Natours Live Demo](https://natours-mp6s.onrender.com)**

The project is deployed on Render. You can access it through the provided link.

## Deployment Note

This project is deployed on the free version of **Render**, so it may take **1-2 minutes** to load when accessed. This delay occurs because, when there are no incoming requests for a while, the server enters **sleep mode** to conserve resources. It will wake up automatically when a new request is made.

## ESLint & Prettier Setup

The `.eslintrc.json` is configured with Airbnb style guide and Prettier integration:

```json
{
  "extends": ["airbnb", "prettier", "plugin:node/recommended"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "off",
    "spaced-comment": "off",
    "no-console": "warn",
    "consistent-return": "off",
    "func-names": "off",
    "object-shorthand": "off",
    "no-process-exit": "off",
    "no-param-reassign": "off",
    "no-return-await": "off",
    "no-underscore-dangle": "off",
    "class-methods-use-this": "off",
    "prefer-arrow-callback": "off",
    "prefer-destructuring": ["error", { "object": true, "array": false }],
    "no-unused-vars": ["error", { "argsIgnorePattern": "req|res|next|val|err" }]
  }
}
```

## Importing Sample Data

To import sample data into MongoDB, contact **Adinath** for a script that will push sample data to the database.

## License

This project is licensed under MIT.

## Author

**Adinath**  
📧 **Email:** [adinathsyadav2016@gmail.com](mailto:adinathsyadav2016@gmail.com)  
🔗 **LinkedIn:** [Adinath Yadav](https://www.linkedin.com/in/adinath-yadav-50a294251/)
