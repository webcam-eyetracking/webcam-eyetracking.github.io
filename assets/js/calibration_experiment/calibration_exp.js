/******************************************************************************
 * STAGE 2 CALIBRATION EXPERIMENT
 * 
 * A wrapper that sits on top of the medusa.js library for the purposes of an 
 * experiment that examines how calibration interactivity and presentation 
 * impact accuracy of webcam eye-tracking.
 *
 * Rough procedure:
 * Calibration → validation 1 (tracking or static) → validation 2 (tracking or static)
 * Repeat x the number of conditions.
 ******************************************************************************/

// Conditions
var interaction; // either "click" or "watch"
var stimuli; // either "static" or "tracking"

/**
 * Launch an experiment that asks the user to first calibrate, then validate 
 * eye gaze accuracy via alternating tracking or static procedures.
 */
function start_calibration_exp(i, s) {
  // Define independent variables for this run
  // interaction = "watch";
  // stimuli = "tracking";
  interaction = i;
  stimuli = s;

  create_consent_form();
}

/**
 * Generates the text to show the participant during the calibration stage, as the
 * instructions will differ depending on interaction (watch or click) as well as 
 * stimuli (static or tracking).
 */
function get_calibration_instructions() {
  var num_trials = calibration_settings.num_trials.toString();
  var text = "This is the calibration step. There will be " + num_trials + 
    " dots in total.";

  // Inform user about static dots
  if (stimuli == "static") {
    if (interaction == "click") {
      var num_clicks = calibration_settings.max_num_clicks.toString();
      text += "<br><br>To advance, please click on each dot " + num_clicks + 
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
  else if (stimuli == "tracking") {
    if (interaction == "click") {
      var num_clicks = calibration_settings.max_num_clicks.toString();
      text += "<br><br>When a dot appears on the screen, please click on it to advance.";
    }
    else if (interaction == "watch") {
      text += "<br><br>When a dot appears on the screen, please follow it with your eyes.";
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
 * Uses the stimuli factor (static or tracking) to determine whether the 
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

  if (stimuli == "static") {  
    if (objects_array.length === 0) {
      objects_array = create_dot_array(calibration_settings.position_array, false).reverse();
    }
    curr_object = objects_array.pop();
  }

  else if (stimuli == "tracking") {
    if (objects_array.length === 0) {
      var temp = {arr: pursuit_paradigm_settings.position_array};
      var obj = $.extend(true, {}, temp);
      objects_array = obj.arr;
      objects_array = shuffle(objects_array);
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
 * Uses the interaction factor (click or watch) to collect training data from
 * the calibration task.
 */
function collect_training_data() {
  if (interaction == "click") {
    num_clicks_on_dot = 0;
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
    console.log("collected data");
    store_data.description = (num_objects_shown + 1).toString();
    send_gaze_data_to_database();
    webgazer.recordScreenPosition(curr_object.x, curr_object.y);
    time_stamp = new Date().getTime();
  }
  else {
    console.error("Invalid interaction type.");
  }
}

/**
 * Uses the stimuli factor (static or tracking) to progress further into
 * the calibration task (e.g. by spawning a new dot or moving the dot
 * along the screen, as appropriate).
 */
function continue_calibration() {
  var canvas = document.getElementById("canvas-overlay");
  var context = canvas.getContext("2d");

  if (stimuli == "static") {
    num_objects_shown++;
    draw_static_dot_calibration(context, curr_object);
  } 
  else if (stimuli == "tracking") {
    num_objects_shown++;
    draw_tracking_dot_calibration(context, curr_object);
  }
  else {
    console.error("Invalid stimulus type.");
    return;
  }
}
