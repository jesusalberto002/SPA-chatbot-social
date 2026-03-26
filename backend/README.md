This is a README file

migrations scripts:

  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1",
    "migrate": "node-pg-migrate", // Base command
    "migrate:create": "npm run migrate -- create", // To create a new migration file
    "migrate:up": "npm run migrate -- up",         // To apply all pending migrations
    "migrate:down": "npm run migrate -- down",       // To revert the last applied migration
    "migrate:status": "npm run migrate -- status"    // To check the status of migrations
  }