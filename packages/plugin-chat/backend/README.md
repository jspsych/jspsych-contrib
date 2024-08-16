# Chat backend

## Overview

This is a simple backend setup that is necessary to protect your OpenAI keys. This server routes the calls from the chat messages in the browser to the OpenAI API endpoint. 

## Local Setup

  1. First you need to install the necessary packages from node by running ```npm install```. This will download all the necessary packages to run the backend locally.
  2. Then you will need to create a .env file in the root of the backend directory with the line ```OPENAI_KEY="personal-key"```.
  3. Then you can run ```node server.js``` in the backend directory, and you should get the message ```Server is running on http://localhost:3000```, indicating the server is working as intended. 

### Hosting server for deploying experiment

For hosting we recommend using a online hosting service or a local server that you trust and using a process manager for node.js environments such as pm2. 

## Author / Citation

Victor Zhang and Niranjan Baskaran
