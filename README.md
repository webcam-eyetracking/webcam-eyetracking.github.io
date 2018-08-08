# Webcam - Eyetracking

The intent of this research project is to collect and analyze eye-tracking data using webcams, thereby shedding light on the feasiblity of using the low-cost cameras of personal devices for eye-tracking in a large-scale online context. The difficulty of deploying eye-tracking experiments to the web, as well as the quality and accuracy of this data, will be assessed. To this end, this project undertakes the development of a series of experiments to both collect data and analyze the output.

Our experiment lives at https://bucknell-hci.github.io/

## Getting Started

These instructions will allow you to easily set up the project for running on your local machine, and set up your own database and such. 

### Related projects

We either refer or use resources for the following projects:
[Webgazer](https://webgazer.cs.brown.edu/) - The main engine to power our webcam eyetracking ability. This project is updated constantly, so we should also regularly update our own webgazer files as well. 
[Online eye tracking with consumer grade webcam](https://osf.io/jmz79/) - The source of inspiration behind two of our experiments - behind simple dot showing and dot moving. This work contains quite detail analysis of the data, and we probably will need to compare the result of our experiments with this one.
[Massvis](http://massvis.mit.edu/) - The primary research project that we are trying to replicate the result using consumer grade webcam. The infographics that we used for our massvis experiemnt is taken from their database. Noted: They have their own github data, which contains a tons of useful information about the visualization. Whatever you wish to seek from this database, check out their github account. 

### Project Structure

We actually use two github account for this project, one for deployment and one for development. Their structures are basically the same. 
[deployment](https://github.com/bucknell-hci/bucknell-hci.github.io.git)
[development](https://gitlab.bucknell.edu/bucknell-hci/webcam-eyetracking.git)
'''
git remote -v
deployment      https://github.com/bucknell-hci/bucknell-hci.github.io.git (fetch)
deployment      https://github.com/bucknell-hci/bucknell-hci.github.io.git (push)
origin  https://gitlab.bucknell.edu/bucknell-hci/webcam-eyetracking.git (fetch)
origin  https://gitlab.bucknell.edu/bucknell-hci/webcam-eyetracking.git (push)
'''
The structure of the project, as the folders' names suggest, are quite self-explanatory. 

### How to Run *(Development Stage)*

The Node.js package `http-server` is already installed in this repository, and lets developers see their (currently, likely bug-laden) code in action without disturbing the [public-facing repository](https://github.com/bucknell-hci/bucknell-hci.github.io) and [production-ready demo](https://bucknell-hci.github.io/).

1. Simply `cd` into the directory containing index.html and run the following command: `http-server -c-1`.
2. This spins up a Node.js httpd which serves the files in your directory as static files accessible from `http://localhost:8080`.
3. Access your code the standard way via localhost and see your latest changes live.

*No need to push or commit your changes. They'll be automatically reflected via your private localhost server.*

### Code Structure

Most of the code live in file medusa.js, which is the primary file to run our website (why medusa? because we deal with eye-gazing a lot). The way the functions in the file is arranged, and also the steps that the website runs, is as follow:

* Show the introduction and consent form
* After consent form, webgazer.js is loaded. We will show the instructions/things that users should know
* Load up the calibration. There are two ways to calibrate, interactive (namely - click) or non-interactive (auto). Right now, we have not decided on the definite way to do this. The previous experiment was done using auto, but we had pretty terrible accuracy with it. However, it may be due to coding errors, so we need to reconfirm this. 
* After calibration, we go to massvis experiment. A series of images are shown, each 10s, with a short break inbetween them. 
* After massvis experiment, we reach stationary dot experiment. 
* After stationary dot experiment, we reach moving dot experiment.
* After moving dot experiment, we ask the user to fill out a short survey.
* After the survey, we have a bonus round. THis does not contribute anything to our research, but it helps making our experiment slightly more interesting. 

### Database installation 

###### Setting up DynamoDb

We use DynamoDb from AWS for our database. The main benefit of usign DynamoDb is that it is well-maintained by Amazon, and we do not need to develop our survey for that. However, of course, there are some restrictions. 

###### DynamoDb pricing

Amazon has their own special ways for pricing, so you should refer to (https://aws.amazon.com/dynamodb/pricing/) for that. It is quite confusing and complicated (as expected of AWS pricing), but the takaways are simple:
* We have 25Gb for free ( which we probably will never be able to use all of it)
* We have 25 read/write capacity for free. As long as we don't exceed these numbers, then we should be in a pretty good shape.

###### Related DynamoDb code

To set up tables for DynamoDb, we can simply use code for that. The code to set up DynamoDb tables are in medusa.js file in the js folder. The read and write capacities are already limited accordingly. The name of the tables are in the setting.js file. So as long as you do not change anything, you do not do anything else to set up DynamoDb at all. Just fire up the website once, and all of the databases will be created using code. 

###### Setting up credentials to use DynamoDb

However, to properly run DynamoDb with our codes, you will need two important items: IdentityPoolId and RoleArn. To use your own AWS account for DynamoDb, you will need to use your own IdentityPoolId and RoleArn, obtained using your AWS account. Simply replace these parameters in the settings.js and settings-test.js files, and you will be able to generate a database with your own aws account. (Of course, you can also use your root access keys to run DynamoDB. However, you shuold NEVER DO THIS. The lost of this key can cause your account to be stolen and used illegally.)

The recommended way is to use Amazon Cognito. The accurate process can be found here: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Cognito.Credentials.html. Using this process, you can obtain IdentityPoolId and RoleArn. 

### Analysis

The analysis is performed using R. However, if you are not comfortable with R, using Python is highly recommended. The simplest way is to install Anaconda, which contains all the necessary libraries to perform any sort of analysis you can immagine so that you don't have to manually instally everything. 
The analysis code is not that matured yet, so it is entirely possible to port the R code into Python code into a reasonable amount of time (at most one or two days). You can also start it from the beginning, if you are not confortable with reading R code. There are still plenty of spaces for improvement. 

###### Pulling data from database

DynamoDb doesn't have an easy way to pulldown all of the data, so we need to code that up. The code to pulldown eyetracking data and user data are in analysis/getCSV/get_eyedata.js and analysis/getCSV/get_users.js. We need node.js to run them though (since .js files require an engine to run them). You are welcome to rewrite the code for this. 

###### Previous data

The data collected from our previous experiment (all 42 of them) is in analysis/getCSV/old_data. However, these data are before I reformat my entire code and fix some errors, so they may not be too trustworthy. Don't base too much of the analysis on them if you can

### Future development of the project

There have been some major blocks which prevent the project from moving forward. First of all, there are some really important questions that pop up along the way, which draws away our attention. Furthermore, these questions should be answered thoroughly before we actually answer our main research questions.

* Which calibration method is better: We are trying two different calibration methods, and we should be able to quantify which method performs better
* Does the result of our experiment depend on the design of our experiment? 

Secondly, the purpose of the research is to test against a lot of people of various groups. Therefore, we need to figure out a way to spread the experiment far and wide. We have a lot of visualizations from massvis, so we also need a lot of data for analysis. This goal has never been achived. The most number of people we have ever had is 42, which is decent but not that much. 