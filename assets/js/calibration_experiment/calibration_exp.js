/******************************************************************************
 * STAGE 2 CALIBRATION EXPERIMENT
 * 
 * A wrapper that sits on top of the medusa.js library for the purposes of an 
 * experiment that examines how calibration interactivity and presentation 
 * impact accuracy of webcam eye-pursuit.
 *
 * Rough procedure:
 * Calibration → validation 1 (pursuit or static) → validation 2 (pursuit or static)
 * Repeat x the number of conditions.
 ******************************************************************************/

// URLs for gifs shown in instructions (hosted on public-facing GitHub)
const STATIC_CLICK_GIF_LOC = 'https://github.com/webcam-eyetracking/webcam-eyetracking.github.io/blob/master/assets/gifs/static_click.gif?raw=true';
const PURSUIT_CLICK_GIF_LOC = 'https://github.com/webcam-eyetracking/webcam-eyetracking.github.io/blob/master/assets/gifs/pursuit_click.gif?raw=true';

// URL to Google Form survey to be completed after the experiment
const GOOGLE_FORM_URL = 'https://goo.gl/forms/4ZCvosWghOFnfznH3';

// Conditions
var interaction; // either "click", "watch", or "placebo" [placebo click]
var stimuli; // either "static" or "pursuit"
var first_validation_task; // either "static" or "pursuit"

// Validation tasks
var remaining_tasks;
var collect_clicks = true;

/**
 * Launch an experiment that asks the user to first calibrate, then validate 
 * eye gaze accuracy via alternating pursuit or static procedures.
 */
function start_calibration_exp(i, s, f) {
  // Define independent variables for this run
  interaction = i;
  stimuli = s;
  first_validation_task = f;

  remaining_tasks = ["static", "pursuit"];
  paradigm = "calibration";
  setup_calibration_html();
}

/**
 * Generates the text to show the participant during the calibration stage, as the
 * instructions will differ depending on interaction (watch or click) as well as 
 * stimuli (static or pursuit).
 */
function get_calibration_instructions() {
  var text = "This is the calibration step. You will be asked to interact with a number of dots" +
    " that will appear onscreen.";

  // Inform user about static dots
  if (stimuli == "static") {
    if (interaction == "click" || interaction == "placebo") {
      var num_clicks = calibration_settings.max_num_clicks.toString();
      text += 
        "<br><br><i>" +
        "Please click on each dot " + num_clicks + " times while looking at it." +
        "</i><br><br>" +
        "<img class='content__gif' src=" + STATIC_CLICK_GIF_LOC + ">";
    }
    else if (interaction == "watch") {
      var num_seconds = (calibration_settings.dot_show_time / 1000).toString();
      text += 
        "<br><br><i>" +
        "Please look at each dot that appears. Each will stay on the screen for " + num_seconds + " seconds." +
        "</i>";
    }
    else {
      text = undefined;
    }
  }

  // Inform user about moving dot
  else if (stimuli == "pursuit") {
    if (interaction == "click" || interaction == "placebo") {
      text += 
        "<br><br><i>" +
        "When a dot appears on the screen, please follow it with your eyes. When the dot stops moving, click on it once to advance." +
        "</i><br><br>" +
        "<img class='content__gif' src=" + PURSUIT_CLICK_GIF_LOC + ">";
    }
    else if (interaction == "watch") {
      text += 
        "<br><br><i>" +
        "When a dot appears on the screen, please follow it with your eyes." +
        "</i>";
    }
    else {
      text = undefined;
    }
  }

  // Erroneous interaction or stimuli global vars
  if (text === undefined) {
    text = "Error: Malformed calibration settings. Please ask for assistance or try again."
  }

  return text;
}

/**
 * Directs control flow of the calibration task as determined by the independent 
 * variables (interaction and stimuli).
 */
function start_calibration_task() {
  // Stimuli switch - How do we check if the calibration is finished?
  check_calibration_finished();  

  // Interactivity switch - How are we collecting gaze training data?
  collect_training_data();  

  // 2nd stimuli switch - How are we progressing further into the calibration step?
  continue_calibration();
}

/**
 * Uses the stimuli factor (static or pursuit) to determine whether the 
 * participant has finished the calibration task.
 */
function check_calibration_finished() {
  if (calibration_current_round > calibration_settings.num_rounds) {
    finish_calibration();
    return;
  }

  // Calibration isn't finished
  var canvas = document.getElementById("canvas-overlay");
  var context = canvas.getContext("2d");
  clear_canvas();

  // Grab coordinates of the next calibration dot from the objects array.
  if (stimuli == "static") {  
    if (objects_array.length === 0) {
      objects_array = create_dot_array(calibration_settings.position_array, false).reverse();
    }
    curr_object = objects_array.pop();
  }
  else if (stimuli == "pursuit") {
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
  }
  else {
    console.error("Invalid stimulus type.");
    return;
  }
}

/**
 * Uses the interaction factor (click, watch, or placebo) to collect training 
 * data from the calibration task.
 */
function collect_training_data() {
  if (interaction == "click") {
    $("#canvas-overlay").unbind("click").click(function (e) {
      var x = e.clientX;
      var y = e.clientY;
      if (Math.pow(x - curr_object.x, 2) + Math.pow(y - curr_object.y, 2) < Math.pow(DEFAULT_DOT_RADIUS, 2) && collect_clicks) {
        num_clicks_on_dot++;
        webgazer.recordScreenPosition(curr_object.x, curr_object.y);
      }
    });
  } 
  else if (interaction == "watch") {
    store_data.description = (num_objects_shown + 1).toString();
    // send_gaze_data_to_database();
    webgazer.recordScreenPosition(curr_object.x, curr_object.y);
  }
  else if (interaction == "placebo") {
    store_data.description = (num_objects_shown + 1).toString();
    // send_gaze_data_to_database();
    webgazer.recordScreenPosition(curr_object.x, curr_object.y);

    // Clicks aren't recorded as data, but still register to advance the experiment
    $("#canvas-overlay").unbind("click").click(function (e) {
      var x = e.clientX;
      var y = e.clientY;
      if (Math.pow(x - curr_object.x, 2) + Math.pow(y - curr_object.y, 2) < Math.pow(DEFAULT_DOT_RADIUS, 2) && collect_clicks) {
        num_clicks_on_dot++;
      }
    });
  }
  else {
    console.error("Invalid interaction type.");
  }
}

/**
 * Uses the stimuli factor (static or pursuit) to progress further into
 * the calibration task (e.g. by spawning a new dot or moving the dot
 * along the screen, as appropriate).
 */
function continue_calibration() {
  var canvas = document.getElementById("canvas-overlay");
  var context = canvas.getContext("2d");

  if (stimuli == "static") {
    num_objects_shown++;
    draw_static_dot_calibration(context);
  } 
  else if (stimuli == "pursuit") {
    num_objects_shown++;
    draw_pursuit_dot_calibration(context);
  }
  else {
    console.error("Invalid stimulus type.");
    return;
  }
}

/**
 * Randomly returns one of the 2 validation tasks (static or pursuit paradigms)
 * and removes this task from the array of remaining tasks to be completed.
 * Returns null if both tasks are complete.
 * @return {string} or {null}
 */
function get_validation_task() {
  if (remaining_tasks.length === 0) {
    return "final";
  }
  else if (remaining_tasks.length === 2) {
    var task_name = first_validation_task;
    remaining_tasks = remaining_tasks.filter(task => task !== first_validation_task);
    return task_name;
  }
  else if (remaining_tasks.length === 1) {
    var task_name = remaining_tasks[0];
    remaining_tasks = [];
    return task_name;
  }
  else {
    return undefined;
  }
}

/**
 * Triggered once the calibration process finishes.
 */
function finish_calibration() {
  calibration_current_round = 1;
  objects_array = [];
  num_objects_shown = 0;
  store_data.description = "success";
  write_calibration_data(); // in calibration_data.js
  // send_gaze_data_to_database();
  webgazer.pause();
  collect_data = false;
  save_webcam_frame(); // Save a snapshot after calibration.
  start_validation_task();
}

/**
 * Proceeds to the two validation tasks (in a randomized order).
 */
function start_validation_task() {
  // Save data if participant has already completed a validation task
  if (remaining_tasks.length < 2) {
    console.log("writing data from task called " + paradigm);
    write_validation_data(paradigm);
    save_webcam_frame(); // Save a snapshot after validation task.
  }

  clear_canvas();
  paradigm = get_validation_task();

  if (paradigm == "final") {
    lighten_canvas();
    show_webcam_debrief();
  }
  else {
    heatmap_data_x = store_data.gaze_x.slice(0);
    heatmap_data_y = store_data.gaze_y.slice(0);
    show_heatmap_text("navigate_tasks"); // from medusa.js
  }
}

/**
 * Leads the participant into a final screen that will be used to collect a 
 * webcam photo. (Can be analyzed afterwards to extract details of lighting/
 * facial structure/other features.)
 */
function show_webcam_debrief() {
  create_general_instruction(
    "Almost done!",
    'On the next screen, please look at the crosshair in the center. We will ' +
    'save a photo from your webcam to help us determine how lighting and other ' +
    'conditions affected the quality of our eye-tracking software.<br><br>' +
    'Press the button when you are ready.',
    "show_final_crosshair()",
    "Continue"
  );
}

/**
 * Shows a blank screen with a centered crosshair that will save a webcam 
 * snapshot and download all eye-tracking data after an elapsed 2.5 sec.
 */
function show_final_crosshair() {
  var canvas = document.getElementById("canvas-overlay");
  darken_canvas();
  draw_fixation_cross(canvas.width * 0.5, canvas.height * 0.5, canvas);
    setTimeout(function() {
      // functions from calibration_data.js:
      save_webcam_frame();
      download_csv();
      finish_experiment();
    }, 2500);
}

/**
 * Shows the final screen and embeds a button that redirects back to the main
 * page of the experiment.
 */
function finish_experiment() {
  clear_canvas();
  lighten_canvas();
  delete_elem("instruction");
  var instruction = document.createElement("div");
  instruction.id = "instruction";
  instruction.className += "overlay-div";
  instruction.style.zIndex = 12;
  instruction.innerHTML +=
    '<header class="form__header">' +
    '<h2 class="form__title">Thank you for participating!</h2>' +
    "<p class='information'>" +
    'Press finish to return to the main screen.' +
    "<p>" +
    "</header>" +
    '<button class="form__button" type="button" onclick="window.location.href = \'../index.html\';">Finish</button>';
  document.body.appendChild(instruction);
}
