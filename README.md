Ayush-ORM
Ayush-ORM is a lightweight Node.js library that simplifies database connections and querying for MySQL, PostgreSQL, and Microsoft SQL Server (MSSQL) databases. It provides a common interface for connecting to and interacting with different database systems.

Features
Supports MySQL, PostgreSQL, and MSSQL databases.
Provides a unified API for connecting to and querying databases.
Easy parameterized query execution with support for prepared statements.
Automatically handles database-specific connection setup.
Installation
To install Ayush-ORM, you can use npm or yarn:

bash
Copy code
npm install ayush-orm
# or
yarn add ayush-orm
Usage
Initializing a Connection
You can initialize a connection to your database using the createConnection function. Specify the database type, hostname, username, password, and other connection details. Here's an example of how to create a connection:

```
const { createConnection } = require('ayush-orm');

const connectionOptions = {
  type: 'mysql', // 'mysql', 'postgres', or 'mssql'
  database: 'mydb',
  hostname: 'localhost',
  username: 'user',
  password: 'password',
  // Add port if necessary (optional)
  // port: 5432,
};

createConnection(connectionOptions)
  .then(() => {
    console.log('Connected to the database');
    // Now you can execute queries
  })
  .catch((error) => {
    console.error('Connection error:', error);
  });

```
Executing Queries
You can execute queries using the executeQuery function after establishing a connection. Pass your SQL query and an array of parameters (if necessary) to the function. It will automatically use the appropriate database connection. Here's an example:

```
const { executeQuery } = require('ayush-orm');

const query = 'SELECT * FROM mytable WHERE column = ?';
const params = ['someValue'];

executeQuery(query, params)
  .then((result) => {
    const { rows, fields } = result;
    console.log('Query result:', rows);
  })
  .catch((error) => {
    console.error('Query error:', error);
  });

```

Supported Databases
MySQL: Requires the mysql2 package.
PostgreSQL: Requires the pg package.
MSSQL: Requires the tedious package.
Make sure to install the necessary database-specific packages according to your use case.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Contribution
Feel free to contribute to this project by opening issues or creating pull requests on GitHub.

Contact
For any questions or feedback, you can reach out to Ayush at ayushshukla7777@gmail.com.

