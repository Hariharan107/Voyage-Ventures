# Voyage-Ventures
Tour Website with Node.js Backend Readme

This project is a tour website that utilizes a Node.js backend. This readme file will guide you through the installation and setup process, as well as provide an overview of the project structure and functionality.
Table of Contents

    Installation
    Project Structure
    Functionality
    Contributing
    License

Installation

To install this project, follow these steps:

    Clone the repository to your local machine.
    Navigate to the project directory in your terminal.
    Run npm install to install the project dependencies.
    Create a .env file in the root of the project and add the following environment variables:

makefile

NODE_ENV=development
PORT=3000

    Run npm run start to start the server.
    Navigate to http://localhost:3000 in your web browser to view the website.


Project Overview 

The project is organized into folders for controllers, models, routes, and views. There is also a folder for utility functions. The app.js file sets up the Express app and middleware. The server.js file starts the server. The start.js file sets up environment variables and starts the server.
Functionality

The tour website allows users to view tours, search for tours, book tours, and leave reviews. Users can also create an account, log in, and update their account settings.

The backend uses Node.js and Express to handle requests and responses. Mongoose is used to interact with a MongoDB database. User authentication is implemented using JWTs and Passport.js. The website is styled using Bootstrap.
Contributing

Contributions to this project are welcome. If you would like to contribute, please fork the repository and submit a pull request.
