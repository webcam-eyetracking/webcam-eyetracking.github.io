
/************************************
 * VARIABLES
 ************************************/
var gazer_id = ""; // id of user
var session_time = ""; // time of current webgazer session
var isChrome = true;
// data variable. Used as a template for the type of data we send to the database. May add other attributes
var store_data = {
  task: "", // the current performing task
  description: "", // a description of the task. Depends on the type of task
  elapsedTime: [], // time since webgazer.begin() is called
  object_x: [], // x position of whatever object the current task is using
  object_y: [], // y position of whatever object the current task is using
  gaze_x: [], // x position of gaze
  gaze_y: [] // y position of gaze
};

// store all of information of the users which we will send to the database
var user = {
  gender: "", // the gender of the user
  age: "", // age of the user
  main_country: "", // country where the user spends the most time in
  current_country: "", // the current country the user is living in
  education_level: "", // the education level of the user
  main_hand: "", // the main hand (left, right or ambidextrous) of the user
  eye_sight: "", // the eye sight of the user. either near-sight, far-sight or normal
  performance: "", // the performance of webgazer
  comment: "" // the comment of the user
};

var collect_data = true;
var face_tracker;
var webgazer_training_data;
var time_stamp; // current time. For functions that requires time delta for animation or controlling sampling rate.
var delta;
var webgazer_time_stamp; // time stamp. Used specifically to control the sampling rate of webgazer
var elem_array = []; // array of elements gazed
var current_task = "instruction"; // current running task.
var curr_object = null; // current object on screen. Can be anything. Used to check collision
var objects_array = []; //array of dots
var num_objects_shown = 0; //number of objects shown
var paradigm = "static"; // the paradigm to use for the test
var possible_paradigm = ["static", "pursuit", "heatmap", "massvis"];
var screen_timeout = 3000;
var cam_width = 320;
var cam_height = 240;
var heatmap_data_x = [];
var heatmap_data_y = [];
var heatmap_image_data;
var calibration_current_round = 1;
var calibration_sprite_1 = [];
var calibration_sprite_2 = [];
var calibration_sprite_3 = [];
var num_clicks_on_dot = 0; // number of times user has clicked on calibration dot
var consent_btn = false; // true if user clicked on 'View Consent & Instructions' button

/************************************
 * SETTING UP AWS
 ************************************/
AWS.config.region = "us-east-2"; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: IdentityPoolId,
  RoleArn: RoleArn
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

/************************************
 * MAIN FUNCTIONS
 ************************************/

/**
 * The only function needed to call when deploy. Simply call this function when you want to start up the program.
 */
function start_medusa(interaction, stimuli, first_validation_task) {
  start_calibration_exp(interaction, stimuli, first_validation_task);
}

/**
 * Create the consent form.
 */
function create_consent_form() {
  // Hide the background and create canvas
  create_overlay();
  var form = document.createElement("div");
  form.id = "consent_form";
  form.className += "consent-div";
  form.innerHTML +=
    '<header class="form__header">' +
    '<h2 class="form__title">Consent form</h2>' +
    "<div>" +
    "<p class='information'><b>Why we are doing this research:</b> We are examining the feasibility of using consumer-grade webcams to conduct eye-tracking experiments to replace traditional methods, such as infrared technology.</p>" +
    "<p class='information'><b>What you will have to do:</b> You will be presented with a series of tasks that involve looking at and interacting with dots on the screen.</p>" +
    "<p class='information'><b>Privacy and data collection:</b> All data is stored on a secure server which only the research team has access to. " + 
    "<br>• Periodically during this experiment, we will use your webcam to take an image in order to understand the impact of environmental factors on gaze prediction. Your image will always be kept private and never shared." +
    "<br>• The streaming images captured by your webcam are <b>not</b> stored. These images are used only to predict the location of your gaze. Those predictions are stored on a secure server, but <i>not</i> the images themselves." +
    "</p>" +
    "<p class='information'><b>Duration:</b> Approximately 10 minutes.</p>" +
    "<p class='information'><b>Taking part is voluntary:</b> You are free to leave the experiment at any time. If you refuse to be in the experiment or stop participating, there will no penalty or loss of benefits to which you are otherwise entitled.</p>" +
    "<p class='information'><b>If you have questions:</b> You may contact Professor Evan Peck at <a href='mailto:evan.peck@bucknell.edu'>evan.peck@bucknell.edu</a>. If you have questions about your rights as a research participant, please contact Matthew Slater, Bucknell University's IRB Chair, at 570.577.2767 or at <a href='mailto:matthew.slater@bucknell.edu'>matthew.slater@bucknell.edu</a>.</p>" +
    "</div>" +
    "</header>" +
    "<form>" +

    // Yes button
    '<button class="consent__button" type="button" onclick="consent_form_navigation(\'yes\')">' +
    'I have read the above information, and have received answers to any questions I asked. I affirm that I am at least 18 years old. I consent to take part in the study.' +
    '</button>' +
    // No button
    '<button class="consent__button" type="button" onclick="consent_form_navigation(\'no\')">' +
    'I decide not to take part in the study.' +
    '</button>' +

    "<p class='information' id='webcam-info' style='color: red'></p>" +
    "</form>";
  form.style.zIndex = 11;
  document.body.appendChild(form);
  var ua = navigator.userAgent.match(
      /(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i
    ),
    browser;
  if (
    navigator.userAgent.match(/Edge/i) ||
    navigator.userAgent.match(/Trident.*rv[ :]*11\./i)
  ) {
    browser = "msie";
  } else {
    browser = ua[1].toLowerCase();
  }
  if (browser !== "chrome") {
    isChrome = false;
    document.getElementById("webcam-info").innerHTML = "";
    document.getElementById("webcam-info").innerHTML += "Please use Chrome!";
  }
}

function consent_form_navigation(answer) {
  if (isChrome === true) {
    if (answer == 'yes') {
      load_webgazer();
    } else {
      window.location.href = "../../index.html";
    }
  }
}

/**
 * Loads Webgazer. Once loaded, starts the collect data procedure.
 */
function load_webgazer() {
  navigator.getUserMedia({
      video: true
    },
    function () {
      $.getScript("./assets/js/webgazer.js")
        .done(function (script, textStatus) {
          initiate_webgazer();
        })
        .fail(function (jqxhr, settings, exception) {
          $("div.log").text("Triggered ajaxError handler.");
        });
    },
    function () {
      document.getElementById("webcam-info").innerHTML = "";
      document.getElementById("webcam-info").innerHTML += "No webcam found.";
    }
  );
}

/**
 * Starts WebGazer and collects data.
 */
function initiate_webgazer() {
  webgazer_time_stamp = 0;
  webgazer
    .clearData()
    .setRegression("ridge")
    .setTracker("clmtrackr")
    .setGazeListener(function (data, elapsedTime) {
      if (data === null) return;
      if (curr_object === undefined || curr_object === null) return;
      if (collect_data === false) return;

      // add calibration point to model
      if (
        elapsedTime - webgazer_time_stamp > 1000 / SAMPLING_RATE &&
        current_task === "calibration"
      ) {
        webgazer.recordScreenPosition(curr_object.x, curr_object.y);
      }

      // collect data from webgazer
      webgazer_time_stamp = elapsedTime;
      store_data.elapsedTime.push(elapsedTime);
      if (current_task === "pursuit") {
        store_data.object_x.push(curr_object.cx);
        store_data.object_y.push(curr_object.cy);
      } else if (current_task === "bonus") {
        loop_bonus_round();
      } else {
        store_data.object_x.push(curr_object.x);
        store_data.object_y.push(curr_object.y);
      }
      store_data.gaze_x.push(data.x);
      store_data.gaze_y.push(data.y);
    });

    // Allow Webgazer 1 second to initialize to avoid 'no stream' errors
    setTimeout(function() {
      webgazer
        .begin()
        .showPredictionPoints(false);
    }, 1000);
    
  check_webgazer_status();
}

/**
 * Checks if webgazer is successfully initiated. If yes, then start carrying out tasks.
 */
function check_webgazer_status() {
  if (webgazer.isReady()) {
    console.log("webgazer is ready.");
    createID(); // Create database

    // If user pressed View Instructions button, proceed with instructions.
    if (consent_btn) {
      create_experiment_instruction();
    }
    // Else, show video feed as part of calibration setup.
    else {
      show_video_feed();
      console.log('showing video feed');
      $('button').prop('disabled', false); // Enable the 'continue' button
    }

    // create_gaze_database();
    // create_user_database();
  } else {
    setTimeout(check_webgazer_status, 100);
  }
}

/**
 * Creates unique ID from time + RNG. Loads the ID from local storage if it's already there.
 */
function createID() {
  gazer_id =
    "id-" +
    (new Date().getTime().toString(16) +
      Math.floor(1e7 * Math.random()).toString(16));
}

/**
 * Creates data table to store the gaze location data.
 */
function create_gaze_database() {
  var params = {
    TableName: TABLE_NAME,
    KeySchema: [{
        AttributeName: "gazer_id",
        KeyType: "HASH"
      },
      {
        AttributeName: "time_collected",
        KeyType: "RANGE"
      } //Sort key
    ],
    AttributeDefinitions: [{
        AttributeName: "gazer_id",
        AttributeType: "S"
      },
      {
        AttributeName: "time_collected",
        AttributeType: "S"
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 20,
      WriteCapacityUnits: 20
    }
  };
  dynamodb.createTable(params, function (err, data) {
    if (err) {
      console.log(
        "Unable to create table: " + "\n" + JSON.stringify(err, undefined, 2)
      );
    } else {
      // console.log(
      //   "Created table: " + "\n" + JSON.stringify(data, undefined, 2)
      // );
    }
  });
}

/**
 * Creates data table to store the information of users.
 */
function create_user_database() {
  var params = {
    TableName: USER_TABLE_NAME,
    KeySchema: [{
        AttributeName: "gazer_id",
        KeyType: "HASH"
      },
      {
        AttributeName: "time_collected",
        KeyType: "RANGE"
      } //Sort key
    ],
    AttributeDefinitions: [{
        AttributeName: "gazer_id",
        AttributeType: "S"
      },
      {
        AttributeName: "time_collected",
        AttributeType: "S"
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };
  dynamodb.createTable(params, function (err, data) {
    if (err) {
      console.log(
        "Unable to create table: " + "\n" + JSON.stringify(err, undefined, 2)
      );
    } else {
      // console.log(
      //   "Created table: " + "\n" + JSON.stringify(data, undefined, 2)
      // );
    }
  });
}

/**
 * Shows experiment instruction
 */
function create_experiment_instruction() {
  session_time = new Date().getTime().toString();
  store_data.task = "experiment";
  store_data.description = "begin";
  // send_gaze_data_to_database();
  if ($("#consent-yes").is(":checked")) {
    var instruction = document.createElement("div");
    var instruction_guide2 =
      "Before we start, there are a few tips we want to share with you to help you progress through the experiment faster.";
    delete_elem("consent_form");
    instruction.id = "instruction";
    instruction.className += "overlay-div";
    instruction.style.zIndex = 12;
    instruction.innerHTML +=
      '<header class="form__header">' +
      '<h2 class="form__title">Thank you for participating.</br></h2>' +
      '<p class="information">' +
      instruction_guide2 +
      "<p>" +
      "</header>" +
      '<button class="form__button" type="button" onclick="create_webcam_instruction_perfect()">Start</button>';
    document.body.appendChild(instruction);
    show_video_feed();
  }
}

function create_general_instruction(
  title,
  information,
  button_action,
  button_label
) {
  clear_canvas();
  delete_elem("instruction");
  var instruction = document.createElement("div");
  instruction.id = "instruction";
  instruction.className += "overlay-div";
  instruction.style.zIndex = 12;
  instruction.innerHTML +=
    '<header class="form__header">' +
    '<h2 class="form__title">' +
    title +
    "</h2>" +
    "<p class='information'>" +
    information +
    "<p>" +
    "</header>" +
    '<button class="form__button" type="button" onclick="delete_elem(\'instruction\'); hide_face_tracker();' +
    button_action +
    '">' +
    button_label +
    "</button>";
  document.body.appendChild(instruction);
  show_video_feed();
}

function create_webcam_instruction_perfect() {
  create_general_instruction(
    "The one thing you need to know!",
    "It is extremely crucial that the program can identify your eyes accurately. How do you know that? The green line should fit your face and your eyes correctly.",
    "create_webcam_instruction_broken(); delete_elem('guide-img');",
    "Continue"
  );
  var guide = new Image();
  guide.src = "../assets/images/guide/Perfect.png";
  guide.id = "guide-img";
  guide.style.display = "block";
  guide.style.position = "fixed";
  guide.style.top = "65%";
  guide.style.left = "calc(50% - 400px)";
  guide.style.zIndex = 13;
  guide.width = cam_width;
  document.body.appendChild(guide);
  var video = document.getElementById("webgazerVideoFeed");
  video.style.left = "calc(50% + 25px)";
  var overlay = document.getElementById("face_tracker");
  overlay.style.left = "calc(50% + 25px)";
}

function create_webcam_instruction_broken() {
  create_general_instruction(
    "When things go wrong",
    "However, the conditions are not always ideal and the program may fail to identify your eyes and your face. Should it fail, the green line will not match your face and your eyes. There are two primary suspects here.",
    "create_webcam_instruction_glasses(); delete_elem('guide-img');",
    "Next"
  );
  var guide = new Image();
  guide.src = "../assets/images/guide/Broken.png";
  guide.id = "guide-img";
  guide.style.display = "block";
  guide.style.position = "fixed";
  guide.style.top = "65%";
  guide.style.left = "calc(50% - 400px)";
  guide.style.zIndex = 13;
  guide.width = cam_width;
  document.body.appendChild(guide);
  var video = document.getElementById("webgazerVideoFeed");
  video.style.left = "calc(50% + 25px)";
  var overlay = document.getElementById("face_tracker");
  overlay.style.left = "calc(50% + 25px)";
}

function create_webcam_instruction_glasses() {
  create_general_instruction(
    "Glasses",
    "Firstly, glasses. The program can't identify your eyes or your face if you wear glasses. Therefore, if you wear glasses, please take them off before continue.",
    "create_webcam_instruction_uneven(); delete_elem('guide-img');",
    "Next"
  );
  var guide = new Image();
  guide.src = "../assets/images/guide/Glasses.png";
  guide.id = "guide-img";
  guide.style.display = "block";
  guide.style.position = "fixed";
  guide.style.top = "65%";
  guide.style.left = "calc(50% - 400px)";
  guide.style.zIndex = 13;
  guide.width = cam_width;
  document.body.appendChild(guide);
  var video = document.getElementById("webgazerVideoFeed");
  video.style.left = "calc(50% + 25px)";
  var overlay = document.getElementById("face_tracker");
  overlay.style.left = "calc(50% + 25px)";
}

function create_webcam_instruction_uneven() {
  // create_general_instruction(
  //   "Lighting conditions",
  //   "Secondly, lighting conditions. This is rather tricky, but the main idea is that you should make sure that you have even lighting across your face. Ideally, the light source should be behind or in front you.",
  //   "create_webcam_instruction_bookstack(); delete_elem('guide-img');",
  //   "Next"
  // );
  create_general_instruction(
    "Lighting conditions",
    "Secondly, lighting conditions. This is rather tricky, but the main idea is that you should make sure that you have even lighting across your face. Ideally, the light source should be behind or in front of you.",
    "create_webcam_instruction_reset(); delete_elem('guide-img');",
    "Next"
  );
  var guide = new Image();
  guide.id = "guide-img";
  guide.src = "../assets/images/guide/Uneven.png";
  guide.style.display = "block";
  guide.style.position = "fixed";
  guide.style.top = "65%";
  guide.style.left = "calc(50% - 400px)";
  guide.style.zIndex = 13;
  guide.width = cam_width;
  document.body.appendChild(guide);
  var video = document.getElementById("webgazerVideoFeed");
  video.style.left = "calc(50% + 25px)";
  var overlay = document.getElementById("face_tracker");
  overlay.style.left = "calc(50% + 25px)";
}

function create_webcam_instruction_bookstack() {
  create_general_instruction(
    "Books are always helpful",
    "We have founded that using a stack of books or something solid to stablize your head during the experiment produces much more accurate result.",
    "create_webcam_instruction_reset(); delete_elem('guide-img');",
    "Continue"
  );
  var guide = new Image();
  guide.src = "../assets/images/guide/Bookstack.png";
  guide.id = "guide-img";
  guide.style.display = "block";
  guide.style.position = "fixed";
  guide.style.top = "65%";
  guide.style.left = "calc(50% - 400px)";
  guide.style.zIndex = 13;
  guide.width = cam_width;
  document.body.appendChild(guide);
  var video = document.getElementById("webgazerVideoFeed");
  video.style.left = "calc(50% + 25px)";
  var overlay = document.getElementById("face_tracker");
  overlay.style.left = "calc(50% + 25px)";
}

function create_webcam_instruction_reset() {
  create_general_instruction(
    "How to recalibrate again",
    "Now, after you have fixed everything, you should try to calibrate again. To do that, move your face away completely from the webcam and then move back to in front of the webcam. The program will recalibrate and it should be able to indentify your face correctly now. If it is not, please perform this step again.",
    "create_webcam_instruction_final_check(); delete_elem('guide-img');",
    "Next"
  );
  var guide = new Image();
  guide.src = "../assets/images/guide/Reset.png";
  guide.id = "guide-img";
  guide.style.display = "block";
  guide.style.position = "fixed";
  guide.style.top = "65%";
  guide.style.left = "calc(50% - 400px)";
  guide.style.zIndex = 13;
  guide.width = cam_width;
  document.body.appendChild(guide);
  var video = document.getElementById("webgazerVideoFeed");
  video.style.left = "calc(50% + 25px)";
  var overlay = document.getElementById("face_tracker");
  overlay.style.left = "calc(50% + 25px)";
}

function create_webcam_instruction_final_check() {
  create_general_instruction(
    "Final words",
    "As you progress through the experiment, try to maintain your head position, and recalibrate whenever you think the program fails to identify your face and your eyes. Again, we really appreciate your participation." +
    "<br><br>Press finish to return to the main page and begin an experiment.",
    "window.location.href = '../../index.html'; delete_elem('guide-img');",
    "Finish"
  );

  var guide = new Image();
  guide.src = "../assets/images/guide/Perfect.png";
  guide.id = "guide-img";
  guide.style.display = "block";
  guide.style.position = "fixed";
  guide.style.top = "65%";
  guide.style.left = "calc(50% - 400px)";
  guide.style.zIndex = 13;
  guide.width = cam_width;
  document.body.appendChild(guide);
  var video = document.getElementById("webgazerVideoFeed");
  video.style.left = "calc(50% + 25px)";
  var overlay = document.getElementById("face_tracker");
  overlay.style.left = "calc(50% + 25px)";
}

/************************************
 * CALIBRATION
 ************************************/

/**
 * Generates the basic template for setting up the instruction page. If the
 * participant isn't using the Chrome browser, displays an error message.
 */
function setup_calibration_html() {
  create_overlay();
  var form = document.createElement("div");
  form.id = "setup";
  form.className += "overlay-div";
  document.body.style.overflow = "hidden";
  form.innerHTML += "<p class='information' id='webcam-info' style='color: red'></p>";
  form.style.zIndex = 11;
  document.body.appendChild(form);
  var ua = navigator.userAgent.match(
      /(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i
    ),
    browser;
  if (
    navigator.userAgent.match(/Edge/i) ||
    navigator.userAgent.match(/Trident.*rv[ :]*11\./i)
  ) {
    browser = "msie";
  } else {
    browser = ua[1].toLowerCase();
  }
  if (browser !== "chrome") {
    isChrome = false;
    document.getElementById("webcam-info").innerHTML = "";
    document.getElementById("webcam-info").innerHTML += "Please use Chrome!";
    return;
  } else {
    form.innerHTML += '<header class="form__header">' +
    '<h2 class="form__title">Experiment Setup</h2>' +
    "<div style='overflow-y: scroll; max-height: 40vh;'>" +
    "<p class='information'>" +
    "Please wait until the program has accurately identified your face. Use the video feed below as a guide. Once this is done, press continue." +
    "</p>" +
    "</div>" +
    "</header>" +
    '<button disabled class="form__button" type="button" onclick="create_calibration_instruction()">Continue</button>' +
    "</form>";
    load_webgazer();
  }
}

/**
 * Shows calibration instructions.
 */
function create_calibration_instruction() {
  webgazer_training_data = undefined;
  delete_elem("setup");
  clear_canvas();
  var instruction = document.createElement("div");
  var calibration_exp_instruction_text = get_calibration_instructions(); // stage 2
  var instruction_guide1 = calibration_exp_instruction_text;
  instruction.id = "instruction";
  instruction.className += "overlay-div";
  instruction.style.zIndex = 12;
  instruction.innerHTML +=
    '<header class="form__header">' +
    '<h2 class="form__title">Calibration</br></h2>' +
    '<p class="information">' +
    instruction_guide1 +
    "</p>" +
    "</header>" +
    '<button class="form__button" type="button" onclick="start_calibration()">Start</button>' +
    '<input id=\'calibration_file\' class="file__button" type="file" onchange="upload_calibration_data(event)"> </input>';
  // "<label for='calibration_file'>" +
  // "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='17' viewBox='0 0 20 17'><path d='M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z'/></svg>" +
  // "<span>Upload previous calibration data</span>" +
  // "</label>";
  document.body.appendChild(instruction);
  show_video_feed();
}

function create_calibration_break_form() {
  show_video_feed();
  collect_data = false;
  clear_canvas();
  var instruction = document.createElement("div");
  instruction.id = "instruction";
  instruction.className += "overlay-div";
  instruction.style.zIndex = 12;
  instruction.innerHTML +=
    '<header class="form__header">' +
    '<h2 class="form__title">Break time! </br> Press the button when you are ready.</h2>' +
    "</header>" +
    '<button class="form__button" type="button" onclick="create_new_dot_calibration()">Continue Calibration</button>';
  document.body.appendChild(instruction);
}

/**
 * Start the calibration
 */
function start_calibration() {
  darken_canvas();
  reset_store_data();
  session_time = new Date().getTime().toString();
  // send initial data to database
  store_data.task = "calibration";
  store_data.description = "begin";
  // send_gaze_data_to_database();
  current_task = "calibration";
  // var gazeDot = document.getElementById("gazeDot");
  // gazeDot.style.zIndex = 14;
  // gazeDot.style.display = "block";
  hide_face_tracker();
  collect_data = true;
  webgazer.resume();
  var canvas = document.getElementById("canvas-overlay");
  var context = canvas.getContext("2d");
  clear_canvas();
  delete_elem("instruction");
  if (webgazer_training_data !== undefined) {
    webgazer.loadTrainingData(webgazer_training_data);
    finish_calibration();
  } else {
    create_new_dot_calibration();
  }
}

/**
 * Create a new dot for calibration.
 */
function create_new_dot_calibration() {
  darken_canvas();
  collect_data = true;
  hide_face_tracker();
  delete_elem("instruction");
  start_calibration_task(); // stage 2
}

/**
 * Draw a dot with a countdown number inside. Used for calibration.
 * 
 * @param {*} context - The 2D rendering context for the HTML5 canvas
 * @param {*} dot - The current object
 */
function draw_dot_calibration(context, dot) {
  var arclen;

  if (interaction === "click") {
    arc_len = (calibration_settings.max_num_clicks - num_clicks_on_dot) * 
      Math.PI * 2 / calibration_settings.max_num_clicks;
  } else { // interaction === "watch"
    var time = new Date().getTime();
    var delta = time - time_stamp;
    arc_len = delta * Math.PI * 2 / calibration_settings.dot_show_time;
  }
  
  draw_dot(context, dot, arc_len);

  // Write the number of calibration dots remaining inside the enclosing circle
  draw_countdown_number(context, dot, calibration_settings.num_rounds, 
    calibration_settings.num_trials, num_objects_shown);

  // Animation
  request_anim_frame(function() {
    // Check exit round conditions for each calibration mode
    if ((interaction === "watch" && delta >= calibration_settings.dot_show_time) ||
        (interaction === "click" && num_clicks_on_dot === calibration_settings.max_num_clicks))
    {
      if (num_objects_shown === calibration_settings.num_trials) {
        calibration_current_round++;
        num_objects_shown = 0;
        heatmap_data_x = store_data.gaze_x.slice(0);
        heatmap_data_y = store_data.gaze_y.slice(0);
        clear_canvas();

        // Check if we've finished all of the calibration rounds
        if (calibration_current_round > calibration_settings.num_rounds) {
          finish_calibration();
          return;
        }
        
        show_heatmap_text("create_calibration_break_form");
        return;
      } else {
        create_new_dot_calibration();
        return;
      }
    }
    draw_dot_calibration(context, dot);
  });
}

/**
 * Triggered once the calibration process finishes. Clean up things and go on to next step
 */
function _finish_calibration() {
  calibration_current_round = 1;
  objects_array = [];
  num_objects_shown = 0;
  store_data.description = "success";
  // send_gaze_data_to_database();
  webgazer.pause();
  collect_data = false;
  paradigm = "static";
  heatmap_data_x = store_data.gaze_x.slice(0);
  heatmap_data_y = store_data.gaze_y.slice(0);
  show_heatmap_text("navigate_tasks");
}

/**
 * start running task based on paradigm
 */
function navigate_tasks() {
  switch (paradigm) {
    case "static":
      create_simple_instruction();
      break;
    case "pursuit":
      create_pursuit_instruction();
      break;
    case "massvis":
      create_massvis_instruction();
      break;
    case "bonus":
      create_bonus_round_instruction();
      break;
    case "survey":
      create_survey();
      break;
    default:
      create_simple_instruction();
  }
}

/************************************
 * STATIC (SIMPLE) DOT VIEWING PARADIGM
 * If you want to introduce your own paradigms, follow the same structure and extend the design array above.
 ************************************/

function create_simple_instruction() {
  session_time = new Date().getTime().toString();
  reset_store_data();
  clear_canvas();
  create_general_instruction(
    "Dot viewing",
    "Focus your gaze on the cross. When a dot appears, please look at it.",
    "loop_simple_paradigm()",
    "Start"
  );
}

function loop_simple_paradigm() {
  var canvas = document.getElementById("canvas-overlay");
  var context = canvas.getContext("2d");
  collect_data = true;
  webgazer.resume();
  clear_canvas();
  current_task = "static_paradigm";
  darken_canvas();

  // Grab more dots if the number of trials exceeds the length of the position array
  if (objects_array.length === 0) {
    objects_array = shuffle(create_dot_array(simple_paradigm_settings.position_array, true));
  }

  curr_object = objects_array.pop();
  num_objects_shown++;

  if (num_objects_shown > simple_paradigm_settings.num_trials) {
    finish_simple_paradigm();
  } else {
    webgazer.pause();
    collect_data = false;
    draw_fixation_cross(canvas.width * 0.5, canvas.height * 0.5, canvas);
    setTimeout(function() {
      clear_canvas();
      time_stamp = new Date().getTime();
      webgazer.resume();
      collect_data = true;
      draw_simple_dot(context, curr_object);
      setTimeout(loop_simple_paradigm, simple_paradigm_settings.dot_show_time);
    }, simple_paradigm_settings.fixation_rest_time);
  }
}

function finish_simple_paradigm() {
  clear_canvas();
  objects_array = [];
  num_objects_shown = 0;
  store_data.task = "static";
  store_data.description = "success";
  webgazer.pause();
  collect_data = false;
  heatmap_data_x = store_data.gaze_x.slice(0);
  heatmap_data_y = store_data.gaze_y.slice(0);
  // send_gaze_data_to_database();
  start_validation_task(); // Return to start_validation_task in calibration_exp.js
}

/************************************
 * SMOOTH PURSUIT PARADIGM
 ************************************/

function create_pursuit_instruction() {
  reset_store_data();
  session_time = new Date().getTime().toString();
  create_general_instruction(
    "Dot pursuit",
    "Please look at the dot and follow it as it moves around the screen.",
    "loop_pursuit_paradigm()",
    "Start"
  );
}

function loop_pursuit_paradigm() {
  darken_canvas();

  if (num_objects_shown >= pursuit_paradigm_settings.num_trials) {
    finish_pursuit_paradigm();
    return;
  }

  // if we don't have dot-positions anymore, refill the array
  var canvas = document.getElementById("canvas-overlay");
  var context = canvas.getContext("2d");
  collect_data = true;
  webgazer.resume();
  current_task = "pursuit_paradigm";

  if (objects_array.length === 0) {
    var temp = {arr: pursuit_paradigm_settings.position_array};
    var obj = $.extend(true, {}, temp);
    objects_array = obj.arr.reverse();
    for (var i = 0; i < objects_array.length; i++) {
      objects_array[i].x = canvas.width * objects_array[i].x;
      objects_array[i].tx = canvas.width * objects_array[i].tx;
      objects_array[i].y = canvas.height * objects_array[i].y;
      objects_array[i].ty = canvas.height * objects_array[i].ty;
    }
  }

  curr_object = objects_array.pop();
  curr_object.cx = curr_object.x;
  curr_object.cy = curr_object.y;
  
  var dot = {
    x: curr_object.cx,
    y: curr_object.cy,
    r: DEFAULT_DOT_RADIUS
  };

  num_objects_shown++;
  draw_dot(context, dot, 0);
  draw_countdown_number(context, dot, 1, pursuit_paradigm_settings.num_trials, num_objects_shown);

  setTimeout(function () {
    time_stamp = null;
    draw_moving_dot(context, dot);
  }, pursuit_paradigm_settings.fixation_rest_time);
}

function finish_pursuit_paradigm() {
  objects_array = [];
  num_objects_shown = 0;
  store_data.task = "pursuit";
  store_data.description = "success";
  current_task = "pursuit_end";
  webgazer.pause();
  collect_data = false;
  heatmap_data_x = store_data.gaze_x.slice(0);
  heatmap_data_y = store_data.gaze_y.slice(0);
  // send_gaze_data_to_database();
  start_validation_task(); // Return to start_validation_task in calibration_exp.js
}

/************************************
 * MASSVIS PARADIGM
 ************************************/
function create_massvis_instruction() {
  reset_store_data();
  session_time = new Date().getTime().toString();
  create_general_instruction(
    "How do we see information? (2/4)",
    "There will be a fixation cross appearing on the screen. Please look at it. <br> When the cross disappears, there will be a data visualization appearing on the screen. Feel free to look at whatever you like on the visualization.",
    "loop_massvis_paradigm()",
    "Start"
  );
}

function loop_massvis_paradigm() {
  if (num_objects_shown >= massvis_paradigm_settings.num_trials) {
    finish_massvis_paradigm();
    return;
  }

  var canvas = document.getElementById("canvas-overlay");
  current_task = "massvis_paradigm";
  collect_data = true;
  webgazer.resume();
  clear_canvas();
  objects_array = shuffle(massvis_paradigm_settings.image_array);
  curr_object = new Image();
  curr_object.src = objects_array.pop();
  store_data.description = curr_object.src;
  draw_fixation_cross(canvas.width * 0.5, canvas.height * 0.5, canvas);
  num_objects_shown++;
  webgazer.pause();
  collect_data = false;
  setTimeout(show_massvis_image, massvis_paradigm_settings.fixation_rest_time);
}

/**
 * Draw massvis
 */
function show_massvis_image() {
  clear_canvas();
  webgazer.resume();
  collect_data = true;
  draw_massvis_image(false);

  var canvas = document.getElementById("canvas-overlay");
  var context = canvas.getContext("2d");
  context.font = FONT_FAMILY;
  context.fillStyle = FONT_COLOR;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    num_objects_shown.toString() +
    " / " +
    massvis_paradigm_settings.num_trials.toString(),
    canvas.width - 50,
    25
  );

  setTimeout(function () {
    store_data.task = "massvis";
    paradigm = "massvis";
    heatmap_data_x = store_data.gaze_x.slice(0);
    heatmap_data_y = store_data.gaze_y.slice(0);
    session_time = new Date().getTime().toString();
    // send_gaze_data_to_database();
    reset_store_data(show_heatmap_text("loop_massvis_paradigm"));
  }, massvis_paradigm_settings.image_show_time);
}

function finish_massvis_paradigm() {
  clear_canvas();
  objects_array = [];
  num_objects_shown = 0;
  num_objects_shown = 0;
  store_data.task = "massvis";
  paradigm = "static";
  webgazer.pause();
  collect_data = false;
  navigate_tasks();
}

/************************************
 * SURVEY
 ************************************/

/**
 * Create the survey
 */
function create_survey() {
  var age_options = "";
  var performance_rating = "";
  for (var i = 18; i < 120; i++) {
    age_options += "<option value=" + i + ">" + i + "</option>";
  }
  for (i = 1; i < 11; i++) {
    performance_rating += "<option value=" + i + ">" + i + "</option>";
  }
  var survey = document.createElement("div");
  delete_elem("consent_form");
  survey.id = "survey";
  survey.className += "overlay-div";
  survey.style.zIndex = 12;
  survey.innerHTML +=
    '<header class="form__header">' +
    '<h2 class="form__title">This is the last of it, we promise.</h2>' +
    "</header>" +
    "<form id='selection_fields' style='max-height: 60%; overflow-y: scroll; overflow-x: hidden'>" +
    "<select id='experience' required>" +
    '<option value="" disabled selected> Have you done this experiment before? </option>' +
    "<option value='yes'> Yes </option>" +
    "<option value='no'> No </option>" +
    "</select>" +
    "</br>" +
    "<select id='age' required>" +
    '<option value="" disabled selected> How old are you? </option>' +
    age_options +
    "</select>" +
    "</br>" +
    "<select id = 'gender' required>" +
    '<option value="" disabled selected> What is your gender? </option>' +
    "<option value='male'> Male </option>" +
    "<option value='female'> Female </option>" +
    "<option value='transgenderfemale'> Transgender Female </option>" +
    "<option value='transgendermale'> Transgender Male </option>" +
    "<option value='gendervariant'> Gender Variant/Non-Conforming </option>" +
    "<option value='notlisted'> Not Listed </option>" +
    "<option value='notanswer'> Prefer not to Answer </option>" +
    "</select>" +
    "</br>" +
    "<select id = 'main_country' required>" +
    '<option value="" disabled selected> Which country have you spent most of your life in? </option>' +
    "<option value='Afghanistan'>Afghanistan</option><option value='Aland Islands'>Aland Islands</option><option value='Albania'>Albania</option><option value='Algeria'>Algeria</option><option value='American Samoa'>American Samoa</option><option value='Andorra'>Andorra</option><option value='Angola'>Angola</option><option value='Anguilla'>Anguilla</option><option value='Antarctica'>Antarctica</option><option value='Antigua And Barbuda'>Antigua And Barbuda</option><option value='Argentina'>Argentina</option><option value='Armenia'>Armenia</option><option value='Aruba'>Aruba</option><option value='Australia'>Australia</option><option value='Austria'>Austria</option><option value='Azerbaijan'>Azerbaijan</option><option value='Bahamas'>Bahamas</option><option value='Bahrain'>Bahrain</option><option value='Bangladesh'>Bangladesh</option><option value='Barbados'>Barbados</option><option value='Belarus'>Belarus</option><option value='Belgium'>Belgium</option><option value='Belize'>Belize</option><option value='Benin'>Benin</option><option value='Bermuda'>Bermuda</option><option value='Bhutan'>Bhutan</option><option value='Bolivia'>Bolivia</option><option value='Bosnia And Herzegovina'>Bosnia And Herzegovina</option><option value='Botswana'>Botswana</option><option value='Bouvet Island'>Bouvet Island</option><option value='Brazil'>Brazil</option><option value='British Indian Ocean Territory'>British Indian Ocean Territory</option><option value='Brunei Darussalam'>Brunei Darussalam</option><option value='Bulgaria'>Bulgaria</option><option value='Burkina Faso'>Burkina Faso</option><option value='Burundi'>Burundi</option><option value='Cambodia'>Cambodia</option><option value='Cameroon'>Cameroon</option><option value='Canada'>Canada</option><option value='Cape Verde'>Cape Verde</option><option value='Cayman Islands'>Cayman Islands</option><option value='Central African Republic'>Central African Republic</option><option value='Chad'>Chad</option><option value='Chile'>Chile</option><option value='China'>China</option><option value='Christmas Island'>Christmas Island</option><option value='Cocos (Keeling) Islands'>Cocos (Keeling) Islands</option><option value='Colombia'>Colombia</option><option value='Comoros'>Comoros</option><option value='Congo'>Congo</option><option value='The Democratic Republic Of The Congo'>The Democratic Republic Of The Congo</option><option value='Cook Islands'>Cook Islands</option><option value='Costa Rica'>Costa Rica</option><option value='Cote Divoire'>Cote Divoire</option><option value='Croatia'>Croatia</option><option value='Cuba'>Cuba</option><option value='Cyprus'>Cyprus</option><option value='Czech Republic'>Czech Republic</option><option value='Denmark'>Denmark</option><option value='Djibouti'>Djibouti</option><option value='Dominica'>Dominica</option><option value='Dominican Republic'>Dominican Republic</option><option value='Ecuador'>Ecuador</option><option value='Egypt'>Egypt</option><option value='El Salvador'>El Salvador</option><option value='Equatorial Guinea'>Equatorial Guinea</option><option value='Eritrea'>Eritrea</option><option value='Estonia'>Estonia</option><option value='Ethiopia'>Ethiopia</option><option value='Falkland Islands (Malvinas)'>Falkland Islands (Malvinas)</option><option value='Faroe Islands'>Faroe Islands</option><option value='Fiji'>Fiji</option><option value='Finland'>Finland</option><option value='France'>France</option><option value='French Guiana'>French Guiana</option><option value='French Polynesia'>French Polynesia</option><option value='French Southern Territories'>French Southern Territories</option><option value='Gabon'>Gabon</option><option value='Gambia'>Gambia</option><option value='Georgia'>Georgia</option><option value='Germany'>Germany</option><option value='Ghana'>Ghana</option><option value='Gibraltar'>Gibraltar</option><option value='Greece'>Greece</option><option value='Greenland'>Greenland</option><option value='Grenada'>Grenada</option><option value='Guadeloupe'>Guadeloupe</option><option value='Guam'>Guam</option><option value='Guatemala'>Guatemala</option><option value='Guernsey'>Guernsey</option><option value='Guinea'>Guinea</option><option value='Guinea-bissau'>Guinea-bissau</option><option value='Guyana'>Guyana</option><option value='Haiti'>Haiti</option><option value='Heard Island And Mcdonald Islands'>Heard Island And Mcdonald Islands</option><option value='Holy See (Vatican City State)'>Holy See (Vatican City State)</option><option value='Honduras'>Honduras</option><option value='Hong Kong'>Hong Kong</option><option value='Hungary'>Hungary</option><option value='Iceland'>Iceland</option><option value='India'>India</option><option value='Indonesia'>Indonesia</option><option value='Iran'>Iran</option><option value='Iraq'>Iraq</option><option value='Ireland'>Ireland</option><option value='Isle Of Man'>Isle Of Man</option><option value='Israel'>Israel</option><option value='Italy'>Italy</option><option value='Jamaica'>Jamaica</option><option value='Japan'>Japan</option><option value='Jersey'>Jersey</option><option value='Jordan'>Jordan</option><option value='Kazakhstan'>Kazakhstan</option><option value='Kenya'>Kenya</option><option value='Kiribati'>Kiribati</option><option value='Democratic Peoples Republic of Korea'>Democratic Peoples Republic of Korea</option><option value='Republic of Korea'>Republic of Korea</option><option value='Kuwait'>Kuwait</option><option value='Kyrgyzstan'>Kyrgyzstan</option><option value='Lao Peoples Democratic Republic'>Lao Peoples Democratic Republic</option><option value='Latvia'>Latvia</option><option value='Lebanon'>Lebanon</option><option value='Lesotho'>Lesotho</option><option value='Liberia'>Liberia</option><option value='Libyan Arab Jamahiriya'>Libyan Arab Jamahiriya</option><option value='Liechtenstein'>Liechtenstein</option><option value='Lithuania'>Lithuania</option><option value='Luxembourg'>Luxembourg</option><option value='Macao'>Macao</option><option value='Macedonia'>Macedonia</option><option value='Madagascar'>Madagascar</option><option value='Malawi'>Malawi</option><option value='Malaysia'>Malaysia</option><option value='Maldives'>Maldives</option><option value='Mali'>Mali</option><option value='Malta'>Malta</option><option value='Marshall Islands'>Marshall Islands</option><option value='Martinique'>Martinique</option><option value='Mauritania'>Mauritania</option><option value='Mauritius'>Mauritius</option><option value='Mayotte'>Mayotte</option><option value='Mexico'>Mexico</option><option value='Micronesia'>Micronesia</option><option value='Republic of Moldova'>Republic of Moldova</option><option value='Monaco'>Monaco</option><option value='Mongolia'>Mongolia</option><option value='Montenegro'>Montenegro</option><option value='Montserrat'>Montserrat</option><option value='Morocco'>Morocco</option><option value='Mozambique'>Mozambique</option><option value='Myanmar'>Myanmar</option><option value='Namibia'>Namibia</option><option value='Nauru'>Nauru</option><option value='Nepal'>Nepal</option><option value='Netherlands'>Netherlands</option><option value='New Caledonia'>New Caledonia</option><option value='New Zealand'>New Zealand</option><option value='Nicaragua'>Nicaragua</option><option value='Niger'>Niger</option><option value='Nigeria'>Nigeria</option><option value='Niue'>Niue</option><option value='Norfolk Island'>Norfolk Island</option><option value='Northern Mariana Islands'>Northern Mariana Islands</option><option value='Norway'>Norway</option><option value='Oman'>Oman</option><option value='Pakistan'>Pakistan</option><option value='Palau'>Palau</option><option value='Palestinian Territory'>Palestinian Territory</option><option value='Panama'>Panama</option><option value='Papua New Guinea'>Papua New Guinea</option><option value='Paraguay'>Paraguay</option><option value='Peru'>Peru</option><option value='Philippines'>Philippines</option><option value='Pitcairn'>Pitcairn</option><option value='Poland'>Poland</option><option value='Portugal'>Portugal</option><option value='Puerto Rico'>Puerto Rico</option><option value='Qatar'>Qatar</option><option value='Reunion'>Reunion</option><option value='Romania'>Romania</option><option value='Russian Federation'>Russian Federation</option><option value='Rwanda'>Rwanda</option><option value='Saint Helena'>Saint Helena</option><option value='Saint Kitts And Nevis'>Saint Kitts And Nevis</option><option value='Saint Lucia'>Saint Lucia</option><option value='Saint Pierre And Miquelon'>Saint Pierre And Miquelon</option><option value='Saint Vincent And The Grenadines'>Saint Vincent And The Grenadines</option><option value='Samoa'>Samoa</option><option value='San Marino'>San Marino</option><option value='Sao Tome And Principe'>Sao Tome And Principe</option><option value='Saudi Arabia'>Saudi Arabia</option><option value='Senegal'>Senegal</option><option value='Serbia'>Serbia</option><option value='Seychelles'>Seychelles</option><option value='Sierra Leone'>Sierra Leone</option><option value='Singapore'>Singapore</option><option value='Slovakia'>Slovakia</option><option value='Slovenia'>Slovenia</option><option value='Solomon Islands'>Solomon Islands</option><option value='Somalia'>Somalia</option><option value='South Africa'>South Africa</option><option value='South Georgia And The South Sandwich Islands'>South Georgia And The South Sandwich Islands</option><option value='Spain'>Spain</option><option value='Sri Lanka'>Sri Lanka</option><option value='Sudan'>Sudan</option><option value='Suriname'>Suriname</option><option value='Svalbard And Jan Mayen'>Svalbard And Jan Mayen</option><option value='Swaziland'>Swaziland</option><option value='Sweden'>Sweden</option><option value='Switzerland'>Switzerland</option><option value='Syrian Arab Republic'>Syrian Arab Republic</option><option value='Taiwan'>Taiwan</option><option value='Tajikistan'>Tajikistan</option><option value='Tanzania'>Tanzania</option><option value='Thailand'>Thailand</option><option value='Timor-leste'>Timor-leste</option><option value='Togo'>Togo</option><option value='Tokelau'>Tokelau</option><option value='Tonga'>Tonga</option><option value='Trinidad And Tobago'>Trinidad And Tobago</option><option value='Tunisia'>Tunisia</option><option value='Turkey'>Turkey</option><option value='Turkmenistan'>Turkmenistan</option><option value='Turks And Caicos Islands'>Turks And Caicos Islands</option><option value='Tuvalu'>Tuvalu</option><option value='Uganda'>Uganda</option><option value='Ukraine'>Ukraine</option><option value='United Arab Emirates'>United Arab Emirates</option><option value='United Kingdom'>United Kingdom</option><option value='United States'>United States</option><option value='United States Minor Outlying Islands'>United States Minor Outlying Islands</option><option value='Uruguay'>Uruguay</option><option value='Uzbekistan'>Uzbekistan</option><option value='Vanuatu'>Vanuatu</option><option value='Venezuela'>Venezuela</option><option value='Viet Nam'>Viet Nam</option><option value='British Virgin Islands'>British Virgin Islands</option><option value='U.S. Virgin Islands'>U.S. Virgin Islands</option><option value='Wallis And Futuna'>Wallis And Futuna</option><option value='Western Sahara'>Western Sahara</option><option value='Yemen'>Yemen</option><option value='Zambia'>Zambia</option><option value='Zimbabwe'>Zimbabwe</option>" +
    "</select>" +
    "</br>" +
    "<select id= 'current_country' required>" +
    "<option value='' disabled selected> Which country are you currently living in? </option>" +
    "<option value='Afghanistan'>Afghanistan</option><option value='Aland Islands'>Aland Islands</option><option value='Albania'>Albania</option><option value='Algeria'>Algeria</option><option value='American Samoa'>American Samoa</option><option value='Andorra'>Andorra</option><option value='Angola'>Angola</option><option value='Anguilla'>Anguilla</option><option value='Antarctica'>Antarctica</option><option value='Antigua And Barbuda'>Antigua And Barbuda</option><option value='Argentina'>Argentina</option><option value='Armenia'>Armenia</option><option value='Aruba'>Aruba</option><option value='Australia'>Australia</option><option value='Austria'>Austria</option><option value='Azerbaijan'>Azerbaijan</option><option value='Bahamas'>Bahamas</option><option value='Bahrain'>Bahrain</option><option value='Bangladesh'>Bangladesh</option><option value='Barbados'>Barbados</option><option value='Belarus'>Belarus</option><option value='Belgium'>Belgium</option><option value='Belize'>Belize</option><option value='Benin'>Benin</option><option value='Bermuda'>Bermuda</option><option value='Bhutan'>Bhutan</option><option value='Bolivia'>Bolivia</option><option value='Bosnia And Herzegovina'>Bosnia And Herzegovina</option><option value='Botswana'>Botswana</option><option value='Bouvet Island'>Bouvet Island</option><option value='Brazil'>Brazil</option><option value='British Indian Ocean Territory'>British Indian Ocean Territory</option><option value='Brunei Darussalam'>Brunei Darussalam</option><option value='Bulgaria'>Bulgaria</option><option value='Burkina Faso'>Burkina Faso</option><option value='Burundi'>Burundi</option><option value='Cambodia'>Cambodia</option><option value='Cameroon'>Cameroon</option><option value='Canada'>Canada</option><option value='Cape Verde'>Cape Verde</option><option value='Cayman Islands'>Cayman Islands</option><option value='Central African Republic'>Central African Republic</option><option value='Chad'>Chad</option><option value='Chile'>Chile</option><option value='China'>China</option><option value='Christmas Island'>Christmas Island</option><option value='Cocos (Keeling) Islands'>Cocos (Keeling) Islands</option><option value='Colombia'>Colombia</option><option value='Comoros'>Comoros</option><option value='Congo'>Congo</option><option value='The Democratic Republic Of The Congo'>The Democratic Republic Of The Congo</option><option value='Cook Islands'>Cook Islands</option><option value='Costa Rica'>Costa Rica</option><option value='Cote Divoire'>Cote Divoire</option><option value='Croatia'>Croatia</option><option value='Cuba'>Cuba</option><option value='Cyprus'>Cyprus</option><option value='Czech Republic'>Czech Republic</option><option value='Denmark'>Denmark</option><option value='Djibouti'>Djibouti</option><option value='Dominica'>Dominica</option><option value='Dominican Republic'>Dominican Republic</option><option value='Ecuador'>Ecuador</option><option value='Egypt'>Egypt</option><option value='El Salvador'>El Salvador</option><option value='Equatorial Guinea'>Equatorial Guinea</option><option value='Eritrea'>Eritrea</option><option value='Estonia'>Estonia</option><option value='Ethiopia'>Ethiopia</option><option value='Falkland Islands (Malvinas)'>Falkland Islands (Malvinas)</option><option value='Faroe Islands'>Faroe Islands</option><option value='Fiji'>Fiji</option><option value='Finland'>Finland</option><option value='France'>France</option><option value='French Guiana'>French Guiana</option><option value='French Polynesia'>French Polynesia</option><option value='French Southern Territories'>French Southern Territories</option><option value='Gabon'>Gabon</option><option value='Gambia'>Gambia</option><option value='Georgia'>Georgia</option><option value='Germany'>Germany</option><option value='Ghana'>Ghana</option><option value='Gibraltar'>Gibraltar</option><option value='Greece'>Greece</option><option value='Greenland'>Greenland</option><option value='Grenada'>Grenada</option><option value='Guadeloupe'>Guadeloupe</option><option value='Guam'>Guam</option><option value='Guatemala'>Guatemala</option><option value='Guernsey'>Guernsey</option><option value='Guinea'>Guinea</option><option value='Guinea-bissau'>Guinea-bissau</option><option value='Guyana'>Guyana</option><option value='Haiti'>Haiti</option><option value='Heard Island And Mcdonald Islands'>Heard Island And Mcdonald Islands</option><option value='Holy See (Vatican City State)'>Holy See (Vatican City State)</option><option value='Honduras'>Honduras</option><option value='Hong Kong'>Hong Kong</option><option value='Hungary'>Hungary</option><option value='Iceland'>Iceland</option><option value='India'>India</option><option value='Indonesia'>Indonesia</option><option value='Iran'>Iran</option><option value='Iraq'>Iraq</option><option value='Ireland'>Ireland</option><option value='Isle Of Man'>Isle Of Man</option><option value='Israel'>Israel</option><option value='Italy'>Italy</option><option value='Jamaica'>Jamaica</option><option value='Japan'>Japan</option><option value='Jersey'>Jersey</option><option value='Jordan'>Jordan</option><option value='Kazakhstan'>Kazakhstan</option><option value='Kenya'>Kenya</option><option value='Kiribati'>Kiribati</option><option value='Democratic Peoples Republic of Korea'>Democratic Peoples Republic of Korea</option><option value='Republic of Korea'>Republic of Korea</option><option value='Kuwait'>Kuwait</option><option value='Kyrgyzstan'>Kyrgyzstan</option><option value='Lao Peoples Democratic Republic'>Lao Peoples Democratic Republic</option><option value='Latvia'>Latvia</option><option value='Lebanon'>Lebanon</option><option value='Lesotho'>Lesotho</option><option value='Liberia'>Liberia</option><option value='Libyan Arab Jamahiriya'>Libyan Arab Jamahiriya</option><option value='Liechtenstein'>Liechtenstein</option><option value='Lithuania'>Lithuania</option><option value='Luxembourg'>Luxembourg</option><option value='Macao'>Macao</option><option value='Macedonia'>Macedonia</option><option value='Madagascar'>Madagascar</option><option value='Malawi'>Malawi</option><option value='Malaysia'>Malaysia</option><option value='Maldives'>Maldives</option><option value='Mali'>Mali</option><option value='Malta'>Malta</option><option value='Marshall Islands'>Marshall Islands</option><option value='Martinique'>Martinique</option><option value='Mauritania'>Mauritania</option><option value='Mauritius'>Mauritius</option><option value='Mayotte'>Mayotte</option><option value='Mexico'>Mexico</option><option value='Micronesia'>Micronesia</option><option value='Republic of Moldova'>Republic of Moldova</option><option value='Monaco'>Monaco</option><option value='Mongolia'>Mongolia</option><option value='Montenegro'>Montenegro</option><option value='Montserrat'>Montserrat</option><option value='Morocco'>Morocco</option><option value='Mozambique'>Mozambique</option><option value='Myanmar'>Myanmar</option><option value='Namibia'>Namibia</option><option value='Nauru'>Nauru</option><option value='Nepal'>Nepal</option><option value='Netherlands'>Netherlands</option><option value='New Caledonia'>New Caledonia</option><option value='New Zealand'>New Zealand</option><option value='Nicaragua'>Nicaragua</option><option value='Niger'>Niger</option><option value='Nigeria'>Nigeria</option><option value='Niue'>Niue</option><option value='Norfolk Island'>Norfolk Island</option><option value='Northern Mariana Islands'>Northern Mariana Islands</option><option value='Norway'>Norway</option><option value='Oman'>Oman</option><option value='Pakistan'>Pakistan</option><option value='Palau'>Palau</option><option value='Palestinian Territory'>Palestinian Territory</option><option value='Panama'>Panama</option><option value='Papua New Guinea'>Papua New Guinea</option><option value='Paraguay'>Paraguay</option><option value='Peru'>Peru</option><option value='Philippines'>Philippines</option><option value='Pitcairn'>Pitcairn</option><option value='Poland'>Poland</option><option value='Portugal'>Portugal</option><option value='Puerto Rico'>Puerto Rico</option><option value='Qatar'>Qatar</option><option value='Reunion'>Reunion</option><option value='Romania'>Romania</option><option value='Russian Federation'>Russian Federation</option><option value='Rwanda'>Rwanda</option><option value='Saint Helena'>Saint Helena</option><option value='Saint Kitts And Nevis'>Saint Kitts And Nevis</option><option value='Saint Lucia'>Saint Lucia</option><option value='Saint Pierre And Miquelon'>Saint Pierre And Miquelon</option><option value='Saint Vincent And The Grenadines'>Saint Vincent And The Grenadines</option><option value='Samoa'>Samoa</option><option value='San Marino'>San Marino</option><option value='Sao Tome And Principe'>Sao Tome And Principe</option><option value='Saudi Arabia'>Saudi Arabia</option><option value='Senegal'>Senegal</option><option value='Serbia'>Serbia</option><option value='Seychelles'>Seychelles</option><option value='Sierra Leone'>Sierra Leone</option><option value='Singapore'>Singapore</option><option value='Slovakia'>Slovakia</option><option value='Slovenia'>Slovenia</option><option value='Solomon Islands'>Solomon Islands</option><option value='Somalia'>Somalia</option><option value='South Africa'>South Africa</option><option value='South Georgia And The South Sandwich Islands'>South Georgia And The South Sandwich Islands</option><option value='Spain'>Spain</option><option value='Sri Lanka'>Sri Lanka</option><option value='Sudan'>Sudan</option><option value='Suriname'>Suriname</option><option value='Svalbard And Jan Mayen'>Svalbard And Jan Mayen</option><option value='Swaziland'>Swaziland</option><option value='Sweden'>Sweden</option><option value='Switzerland'>Switzerland</option><option value='Syrian Arab Republic'>Syrian Arab Republic</option><option value='Taiwan'>Taiwan</option><option value='Tajikistan'>Tajikistan</option><option value='Tanzania'>Tanzania</option><option value='Thailand'>Thailand</option><option value='Timor-leste'>Timor-leste</option><option value='Togo'>Togo</option><option value='Tokelau'>Tokelau</option><option value='Tonga'>Tonga</option><option value='Trinidad And Tobago'>Trinidad And Tobago</option><option value='Tunisia'>Tunisia</option><option value='Turkey'>Turkey</option><option value='Turkmenistan'>Turkmenistan</option><option value='Turks And Caicos Islands'>Turks And Caicos Islands</option><option value='Tuvalu'>Tuvalu</option><option value='Uganda'>Uganda</option><option value='Ukraine'>Ukraine</option><option value='United Arab Emirates'>United Arab Emirates</option><option value='United Kingdom'>United Kingdom</option><option value='United States'>United States</option><option value='United States Minor Outlying Islands'>United States Minor Outlying Islands</option><option value='Uruguay'>Uruguay</option><option value='Uzbekistan'>Uzbekistan</option><option value='Vanuatu'>Vanuatu</option><option value='Venezuela'>Venezuela</option><option value='Viet Nam'>Viet Nam</option><option value='British Virgin Islands'>British Virgin Islands</option><option value='U.S. Virgin Islands'>U.S. Virgin Islands</option><option value='Wallis And Futuna'>Wallis And Futuna</option><option value='Western Sahara'>Western Sahara</option><option value='Yemen'>Yemen</option><option value='Zambia'>Zambia</option><option value='Zimbabwe'>Zimbabwe</option>" +
    "</select>" +
    "</br>" +
    "<select id = 'education_level' required>" +
    '<option value="" disabled selected> What is the highest level of education you have received or are pursuing? </option>' +
    "<option value='pre-high school'>Pre-high school</option><option value='high school'>High school</option><option value='college'>College</option><option value='graduate school'>Graduate school</option><option value='professional school'>Professional school</option><option value='PhD'>PhD</option><option value='postdoctoral'>Postdoctoral</option>" +
    "</select>" +
    "</br>" +
    "<select id = 'vision' required>" +
    '<option value="" disabled selected> How is your vision? </option>' +
    "<option value='perfect'>Perfect</option><option value='corrected'>Glasses/Contacts (corrected) </option><option value='other'>Other</option>" +
    "</select>" +
    "</br>" +
    "<select id = 'handedness' required>" +
    '<option value="" disabled selected> What is your handedness? </option>' +
    "<option value='right-handed'>Right-handed</option><option value='left-handed'>Left-handed</option><option value='ambidextrous'>Ambidextrous</option>" +
    "</select>" +
    "</br>" +
    "<select id = 'performance' required>" +
    '<option value="" disabled selected> On a scale of 1 to 10, how well do you think the eye tracker performed? </option>' +
    performance_rating +
    "</select>" +
    "</br>" +
    "<textarea rows='5' id = 'comment' style='width: calc(100% - 10px)' name='comment' form='selection_fields' placeholder='Comments...'></textarea>" +
    "</form>" +
    "<p id='survey_info' class='information'></p>" +
    "</br>" +
    '<button class="form__button" type="button" onclick = \'send_user_data_to_database(finish_survey)\'> Submit and draw an awesome image with your eyes! </button>'
  document.body.appendChild(survey);
}

function finish_survey() {
  delete_elem("survey");
}

/************************************
 * BONUS ROUND
 * If you want to introduce your own paradigms, follow the same structure and extend the design array above.
 ************************************/
function create_bonus_round_instruction() {
  reset_store_data();
  session_time = new Date().getTime().toString();
  create_general_instruction(
    "Bonus Round",
    "Make a painting with just your eyes.<br> This task is optional.",
    "create_heatmap_overlay()",
    "Start"
  );
  var instruction = document.getElementById("instruction");
  instruction.innerHTML +=
    '<button class="form__button" type="button" onclick="window.location.href = "../index.html";"> Home </button>';
}

function create_heatmap_overlay() {
  var function_name = "upload_to_imgur";
  current_task = "bonus";
  collect_data = true;
  webgazer.resume();
  webgazer.showPredictionPoints(true);
  var canvas = document.createElement("canvas");
  canvas.id = "heatmap-overlay";
  // canvas.addEventListener("mousedown", canvas_on_click, false);
  // style the newly created canvas
  canvas.style.zIndex = 11;
  canvas.style.position = "fixed";
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  var button = document.createElement("button");
  button.className += "form__button";
  button.id = "heatmap-button";
  button.style.opacity = 0.5;
  button.style.right = "1em";
  button.style.bottom = "2em";
  button.innerHTML = "Done";
  button.style.position = "absolute";
  button.style.zIndex = 99;
  button.addEventListener("click", function () {
    window[function_name](canvas);
    webgazer.pause();
    collect_data = false;
    delete_elem("heatmap-button");
  });
  button.onmouseover = function () {
    button.style.opacity = 1;
  };
  button.onmouseout = function () {
    button.style.opacity = 0.5;
  };
  document.body.appendChild(button);
}

function loop_bonus_round() {
  var canvas = document.getElementById("heatmap-overlay");
  var heat = simpleheat(canvas);
  var points = [];
  for (i = 0; i < store_data.gaze_x.length; i++) {
    var point = [store_data.gaze_x[i], store_data.gaze_y[i], 0.1];
    points.push(point);
  }

  heat.data(points);
  heat.draw();
}

function upload_to_imgur(canvas) {
  var image = canvas.toDataURL().slice(22);
  var form = new FormData();
  form.append("image", image);

  var settings = {
    async: true,
    crossDomain: true,
    url: "https://api.imgur.com/3/image",
    method: "POST",
    headers: {
      authorization: "Bearer b99c6cfd9f5ed209e572032238a4a4db48e3ed3d"
    },
    processData: false,
    contentType: false,
    mimeType: "multipart/form-data",
    data: form
  };

  $.ajax(settings).done(function (response) {
    var link = JSON.parse(response).data.link;
    bonus_round_share(link);
    store_data.description = link;
    store_data.object_x = [0];
    store_data.object_y = [0];
    // send_gaze_data_to_database();
  });
}

function bonus_round_share(link) {
  // document.body.innerHTML += "<div id='fb-share-div' style='position: absolute; z-index: 99; bottom: 2em; right: 10em; vertical-align: bottom; background-color: #3b5998; ' class='fb-share-button form__button' data-href='https://khaiquangnguyen.github.io' data-layout='button' data-size='large' data-mobile-iframe='false'><a style='text-decoration: none!important; color:" + background_color + "!important;' class='fb-xfbml-parse-ignore' target='_blank' href='https://www.facebook.com/sharer/sharer.php?u=" + link + "&amp;src=sdkpreparse'>Share on Facebook</a></div>";
  var share_link = "";
  var button = document.createElement("button");
  button.className += "form__button";
  button.id = "heatmap-button";
  button.style.opacity = 0.5;
  button.style.right = "1em";
  button.style.bottom = "2em";
  button.innerHTML = "Next";
  button.style.position = "absolute";
  button.style.zIndex = 99;
  button.addEventListener("click", function () {
    finish_bonus_round();
  });
  button.onmouseover = function () {
    button.style.opacity = 1;
  };
  button.onmouseout = function () {
    button.style.opacity = 0.5;
  };
  document.body.appendChild(button);

  var share_button_fb = document.createElement("button");
  share_button_fb.style.backgroundColor = "#3b5998";
  share_button_fb.className += "form__button";
  share_button_fb.id = "bonus-round-share-button-fb";
  share_button_fb.style.right = "10em";
  share_button_fb.style.bottom = "2em";
  share_button_fb.innerHTML = "Share on Facebook";
  share_button_fb.style.position = "absolute";
  share_button_fb.style.zIndex = 99;
  share_button_fb.addEventListener("click", function (e) {
    link = encodeURIComponent(link);
    share_link =
      "https://www.facebook.com/dialog/share?" +
      "app_id=114582132643609" +
      "&quote=" +
      encodeURIComponent(
        "I made this drawing only with my eyes. You can make your own AND contribute to science at: https://bucknell-hci.github.io"
      ) +
      "&href=" +
      link +
      "&display=popup";
    window.open(share_link, "_blank");
  });

  document.body.appendChild(share_button_fb);

  var share_button_tw = document.createElement("button");
  share_button_tw.style.backgroundColor = "#1DA1F2";
  share_button_tw.className += "form__button";
  share_button_tw.id = "bonus-round-share-button-tw";
  share_button_tw.style.right = "30em";
  share_button_tw.style.bottom = "2em";
  share_button_tw.innerHTML = "Share on Twitter";
  share_button_tw.style.position = "absolute";
  share_button_tw.style.zIndex = 99;
  share_button_tw.addEventListener("click", function () {
    link = link.replace("i.", "");
    link = link.slice(0, -4);
    share_link =
      "https://twitter.com/intent/tweet?text=" +
      link +
      " " +
      encodeURIComponent(
        "I made this drawing only with my eyes. You can make your own AND contribute to science at: https://bucknell-hci.github.io"
      );
    window.open(share_link, "_blank");
  });

  document.body.appendChild(share_button_tw);
}

function finish_bonus_round() {
  delete_elem("heatmap-overlay");
  webgazer.showPredictionPoints(false);
  delete_elem("bonus-round-share-button-fb");
  delete_elem("bonus-round-share-button-tw");
  delete_elem("heatmap-button");
  clear_canvas();
  num_objects_shown = 0;
  webgazer.pause();
  collect_data = false;
  window.location.href = "../index.html";
}
