# Yak

[![CircleCI](https://circleci.com/gh/Capgemini-AIE/yak.svg?style=svg&circle-token=0708550252d95317487062bb62014c79e4eb9ff9)](https://circleci.com/gh/Capgemini-AIE/yak) 

This project lets you build a chatbot, without having to write the boilerplate. Fork it for your own project and start modifying and extending. If improvements are made to this project which you require, add this repository as an upstream git remote and merge it into your forked repo.

Documentation exists on the Github wiki.

### Dependencies:

We depend on a few technologies, please make sure you have the below prerequisites.

  * CloudantDB (or CouchDB) instance
  * Microsoft Bot Framework App
  * LUIS.ai App

## Quickstart:

  * Install above prerequisites
  * Setup Environment Variables
  * Install Dependencies (Yarn)
  
### Install prerequisites

#### Cloudant
Use docker (install docker CE for your operating system [https://docs.docker.com/engine/installation/]() if you haven't already) to create a local cloudant instance:

    cd docker
    docker-compose up

#### Microsoft Bot Framework
Login to [https://dev.botframework.com/]() with the AIE london credentials. Using the web console you can create a bot application to integrate with.

#### Luis
Luis is the intelligence behind the language processing and its where you will specify all your intents and entities are stored.

Log in with the AIE london credentials and create an app.

### Set up environment variables
Create a .env file in the server folder and the ui folder. Copy the env variable keys from the example.env files. Ask a colleague for the defaults for these variables.

### Install dependencies
Run, from the root folder of this project:

    yarn bootstrap

### Running using Bot Emulator

  * Install Bot Framework Emulator [https://docs.microsoft.com/en-us/bot-framework/debug-bots-emulator]()
  * Install [https://ngrok.com](ngrok), found at [https://ngrok.com/download]().
  * Run the bot from the command line using `yarn start` in the root of the project.
  * In Bot Framework Emulator enter "http://localhost:3978/api/messages" as endpoint and connect with credentials from your .env.
  * Say "Hi" in the emulator
  
### Running using UI

  * This requires a development app in Microsoft bot framework and Luis
  * Run a tunnel for direct line to the Microsoft bot app
  * Run the bot from the command line using `yarn start` in the root of the project.
  * Say "Hi"
  
## Notes

### The Chat UI
The chat UI is only used for chatting to the production bots, not for use locally or developing. The Emulator will communicate with your server and provide everything you need to debug and develop.

### The admin UI
The admin UI is used to configure the super chargers and it stores these things in the database which the server uses.

### Lerna and Logging
Running `yarn start` from the root folder of this project runs yarn start in both ui and server projects but hides all the logs. If something goes wrong, you need to start the server up by:

    cd server
    yarn start
    
This will output the server logs to the console.


