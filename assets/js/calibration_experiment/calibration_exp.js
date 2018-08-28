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

// Conditions
var interaction; // either "click", "watch", or "placebo" [placebo click]
var stimuli; // either "static" or "pursuit"

// Validation tasks
var remaining_tasks;

/**
 * Launch an experiment that asks the user to first calibrate, then validate 
 * eye gaze accuracy via alternating pursuit or static procedures.
 */
function start_calibration_exp(i, s) {
  // Define independent variables for this run
  interaction = i;
  stimuli = s;
  remaining_tasks = ["static", "pursuit"];

  // create_consent_form();
  setup_calibration_html();
}

/**
 * Generates the text to show the participant during the calibration stage, as the
 * instructions will differ depending on interaction (watch or click) as well as 
 * stimuli (static or pursuit).
 */
function get_calibration_instructions() {
  var num_trials = calibration_settings.num_trials.toString();
  var text = "This is the calibration step. There will be " + num_trials + 
    " dots in total.";

  // Inform user about static dots
  if (stimuli == "static") {
    if (interaction == "click" || interaction == "placebo") {
      var num_clicks = calibration_settings.max_num_clicks.toString();
      text += "<br><br>Please click on each dot " + num_clicks + 
        " times while looking at it."
    }
    else if (interaction == "watch") {
      var num_seconds = (calibration_settings.dot_show_time / 1000).toString();
      text += "<br><br>Please look at each dot that appears. Each will stay on the screen " +
        "for " + num_seconds + " seconds.";
    }
    else {
      text = undefined;
    }
  }

  // Inform user about moving dot
  else if (stimuli == "pursuit") {
    if (interaction == "click" || interaction == "placebo") {
      text += "<br><br>When a dot appears on the screen, please follow it " +
        "with your eyes. When the dot stops moving, click on it once to advance.";
    }
    else if (interaction == "watch") {
      text += "<br><br>When a dot appears on the screen, please follow it " +
        "with your eyes.";
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
      if (Math.pow(x - curr_object.x, 2) + Math.pow(y - curr_object.y, 2) < Math.pow(DEFAULT_DOT_RADIUS, 2)) {
        num_clicks_on_dot++;
        webgazer.recordScreenPosition(curr_object.x, curr_object.y);
      }
    });
  } 
  else if (interaction == "watch") {
    store_data.description = (num_objects_shown + 1).toString();
    // send_gaze_data_to_database();
    webgazer.recordScreenPosition(curr_object.x, curr_object.y);
    time_stamp = new Date().getTime();
  }
  else if (interaction == "placebo") {
    store_data.description = (num_objects_shown + 1).toString();
    // send_gaze_data_to_database();
    webgazer.recordScreenPosition(curr_object.x, curr_object.y);
    time_stamp = new Date().getTime();
    // Clicks aren't recorded as data, but still register to advance the experiment
    $("#canvas-overlay").unbind("click").click(function (e) {
      var x = e.clientX;
      var y = e.clientY;
      if (Math.pow(x - curr_object.x, 2) + Math.pow(y - curr_object.y, 2) < Math.pow(DEFAULT_DOT_RADIUS, 2)) {
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
    return null;
  }
  else {
    var index = Math.floor(Math.random() * remaining_tasks.length);
    var task_name = remaining_tasks[index];
    remaining_tasks.splice(index, 1); // Remove the item from the array
    return task_name;
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
  }

  paradigm = get_validation_task();

  if (paradigm == null) {
    paradigm = "survey"; // Finished!
    clear_canvas();
    lighten_canvas();
    download_csv(); // Save all data from this trial
    create_survey();
  }
  else {
    heatmap_data_x = store_data.gaze_x.slice(0);
    heatmap_data_y = store_data.gaze_y.slice(0);
    show_heatmap_text("navigate_tasks"); // from medusa.js
  }
}
