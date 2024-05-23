# MERN Chat Application

This is a real-time chat application built using the MERN (MongoDB, Express, React, Node.js) stack. The application supports user registration, login, and real-time messaging with socket.io.

## Features

- User registration and authentication
- Real-time messaging using socket.io
- JWT-based authentication
- RESTful API for user management

## Prerequisites

- Node.js
- Yarn
- MongoDB

## Getting Started

### Clone the Repository

```sh
git clone https://github.com/syed-002/mern-chat.git
cd mern-chat
Install Dependencies
For the server
sh
Copy code
cd api
yarn install
For the client
sh
Copy code
cd ../client
yarn install
Environment Variables
Create a .env file in the api directory with the following content:

env
Copy code
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.grghxk6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret
Running the Application
Start the server
sh
Copy code
cd api
yarn start
Start the client
sh
Copy code
cd ../client
yarn start
The server will be running on http://localhost:5001 and the client on http://localhost:3000.
