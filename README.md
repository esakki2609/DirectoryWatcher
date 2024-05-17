# Task Scheduler API:

The Task Scheduler API is a RESTful service built with Express.js and Prisma ORM for scheduling tasks based on interval Directory and managing associated files. It allows users to create Directory, start and stop tasks, manage files, and retrieve task details.

# Table of Contents
Features
Installation
Usage
Endpoints
Dependencies
License

# Features
Task Scheduling: Schedule tasks to run at specified intervals.
File Management: Create, delete, and manage files associated with task Directory.
Directory Management: Create, update, and retrieve task Directory.
Task Monitoring: Get details about running tasks and their execution status.

# Installation
Clone the repository:
git clone https://github.com/your-username/task-scheduler-api.git

# Install dependencies:
cd task-scheduler-api
npm install

# Set up the database:
Create a .env file in the root dir and specify your database connection URL:
DATABASE_URL=mysql://username:password@localhost:3306/database_name

# Run Prisma migrations to create database tables:
npx prisma migrate dev

# Start the server:
npm start

# Access the API:
The API will be available at http://localhost:3000 by default.

# Endpoints
GET /dir: Get all Directories.
GET /dir/:id: Get a specific Directory details by ID.
POST /dir: Create a new Directory.
PUT /dir/update: Update an existing Directory.
GET /startTask/:id: Start a task(count the MagicString) based on Directory ID.
GET /stopTask/:id: Stop a running task.
GET /taskDetails/:id: Get details of a task run by Directory ID.
POST /dir/createFiles: Create and add files to a Directory.
DELETE /dir/:directoryId/deleteFile/:id: Delete a file from a Directory.

# Dependencies
Express: Web framework for handling HTTP requests.
Prisma ORM: Database toolkit for interfacing with Mysql.
body-parser: Middleware for parsing request bodies.
fs & path: Node.js modules for file system operations and path manipulation.

# License
This project is licensed under the MIT License - see the LICENSE file for details.
