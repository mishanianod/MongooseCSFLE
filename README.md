# mongoose-csfle

### PREREQUISITE 

1. Install heroku CLI using the following link - https://devcenter.heroku.com/articles/heroku-cli
2. Set environment varibable in heroku, *CONN_STRING* to MongoDB srv string. Setting>>CONFIG_VARS
3. Run the following command to set the team where the heroku app is created `export HEROKU_ORGANIZATION=<team-name>`

## Method 1: Deployment to Heroku using Github(Branch =  main)

This version is using main branch of this repostiory and is using stack22 of the heroku which uses Ubuntu22 as default, hence the shared crypt library is also for the Ubuntu compatible deployment. 

### Step 1: Clone the repository
cd into the working directory and clone the repository `git clone -b main git@github.com:Pacifier24/mongoose-csfle.git`

### Step 2: Set heroku stack 
`heroku stack:set heroku-22 -a mongoosecsfle`

### Step 3: Set remote to heroku git
`heroku git:remote -a mongoosecsfle`

### Step 4: Push and deploy
`git push heroku main`


## Method 2: Deployment to Heroku using Docker image(Branch =  csfle-docker-deployment)

This repository contains a docker image `Dockerfile` using node:14 as the base image. For CSFLE to function, it also requires a shared library which is compatible
with the OS running the deployment. For instance the node:14 base image uses Debian as the underlying OS, and hence the default library is downloaded from for Debian
via https://www.mongodb.com/try/download/enterprise. Moreover this method of deployment doesn't use heroku.yml option.

### Step 1: Login in heroku container CLI
After Installing the heroku CLI, login in the heroku CLI via terminal using `heroku container:login` command, the CLI will redirect the user to the browser for login. 

### Step 2: Clone the repository
cd into the working directory and clone the repository `git clone -b csfle-docker-deployment git@github.com:Pacifier24/mongoose-csfle.git`

### Step 3: Push the docker image to the heroku container registry(app name is mongoosecsfle)
Run the following command `heroku container:push web --app mongoosecsfle`

### Step 4: Release/Deploy the container image
Run the following command to release or deploy the container image, `heroku container:release web --app mongoosecsfle`

### Step 5: Check for logs to confirm if the deployment was successful 
Run the following command to check the logs `heroku logs --app mongoosecsfle`
