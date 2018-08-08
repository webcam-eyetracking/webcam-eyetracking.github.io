/******************************************************************************
 * STAGE 2 CALIBRATION EXPERIMENT
 * 
 * A wrapper that sits on top of the medusa.js library for the purposes of an 
 * experiment that examines how calibration interactivity and presentation 
 * impact accuracy of webcam eye-tracking.
 ******************************************************************************/

// Rough procedure:
// Calibration → validation 1 (tracking or static) → validation 2 (tracking or static)
// Repeat x the number of conditions.

// Conditions
var interaction; // either "click" or "watch"
var stimuli; // either "static" or "tracking"

/**
 * Called within function create_webcam_instruction_final_check in medusa.js to
 * launch an experiment that asks the user to first calibrate, then validate 
 * eye gaze accuracy via alternating tracking or static procedures.
 */
function start_calibration_exp() {
  // Define independent variables for this run
  interaction = "click";
  stimuli = "static";

  create_consent_form();
}

/**
 * Generates the text to show the participant during the calibration stage, as the
 * instructions will differ depending on interaction (watch or click) as well as 
 * stimuli (static or tracking).
 */
function get_calibration_instructions() {
  var text;

  // Inform user about static dots
  if (stimuli == "static") {
    var num_trials = calibration_settings.num_trials.toString();
    text = "This is the calibration step. There will be " + num_trials + " dots in total.";
    // Inform user about clicking interaction
    if (interaction == "click") {
      var num_clicks = calibration_settings.max_num_clicks.toString();
      text += "<br><br>To advance, please click on each dot " + num_clicks + 
        " times while looking at it."
    }
    // Inform user about watching interaction
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
  else if (stimuli == "tracking") {
    // ** TODO
  }

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
  // ** TODO: Set up support for calibration with pursuit (tracking) stimuli

  // Stimuli switch
  if (stimuli == "static") {
    if (calibration_current_round > calibration_settings.num_rounds) {
      finish_calibration();
      return;
    }
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    clear_canvas();
    if (objects_array.length === 0) {
      objects_array = create_dot_array(calibration_settings.position_array, false).reverse();
    }
    curr_object = objects_array.pop();
  }

  // Interactivity switch - How are we collecting gaze training data?
  if (interaction == "click") {
    num_clicks_on_dot = 0;
    $("#canvas-overlay").unbind("click").click(function (e) {
      var x = e.clientX;
      var y = e.clientY;
      if (Math.pow(x - curr_object.x, 2) + Math.pow(y - curr_object.y, 2) < Math.pow(DEFAULT_DOT_RADIUS, 2)) {
        num_clicks_on_dot++;
      }
    });
  } else if (interaction == "watch") {
    store_data.description = (num_objects_shown + 1).toString();
    send_gaze_data_to_database();
    webgazer.recordScreenPosition(curr_object.x, curr_object.y);
    time_stamp = new Date().getTime();
  }

  // Stimuli switch
  if (stimuli == "static") {
    draw_dot_calibration(context, curr_object, DOT_COLOR);
    num_objects_shown++;
  }
}