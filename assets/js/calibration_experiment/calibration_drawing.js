/******************************************************************************
 * STAGE 2 CALIBRATION EXPERIMENT
 * 
 * Functions responsible for rendering the calibration dots presented to
 * participants to gather training data.
 ******************************************************************************/


/*******************************************************************************
 *                              STATIC CALIBRATION
 ******************************************************************************/

/**
 * The root entry into the static calibration procedure, which will 
 * continuously draw new dots until the number of trials has been met.
 * @param {*} context - The 2D rendering context for the HTML5 canvas
 */
function draw_static_dot_calibration(context) {
  var dot = curr_object;
  draw_dot(context, dot, get_arc_length());

  // Write the number of calibration dots remaining inside the enclosing circle.
  draw_countdown_number(context, dot, calibration_settings.num_rounds, 
    calibration_settings.num_trials, num_objects_shown);

  request_anim_frame(function() {
    var done = check_static_trial_done();
    if (done) {
      finish_static_trial();
    }
    else {
      draw_static_dot_calibration(context, dot); // Continue rendering this dot.
    }
  });
}

/**
 * For static calibration tasks, dots have a receding ring (arc) around them
 * as a visual indicator of remaining screentime.
 * @return {int} the proportion of the arc to be REMOVED from the ring
 */
function get_arc_length() {
  if (interaction === "click" || interaction === "placebo") {
    return (calibration_settings.max_num_clicks - num_clicks_on_dot) * 
      Math.PI * 2 / calibration_settings.max_num_clicks;
  } 
  else if (interaction === "watch") {
    var time = new Date().getTime();
    delta = time - time_stamp;
    return delta * Math.PI * 2 / calibration_settings.dot_show_time;
  }
  else {
    console.error("Invalid interaction type.");
    return undefined;
  }
}

/**
 * Returns true if the current calibration dot has been onscreen for the 
 * appropriate period of time; false otherwise.
 */
function check_static_trial_done() {
  if (interaction == "watch") {
    return delta >= calibration_settings.dot_show_time;
  }
  else if (interaction == "click" || interaction === "placebo") {
    return num_clicks_on_dot === calibration_settings.max_num_clicks;
  }
  else {
    console.error("Invalid interaction type.")
    return undefined;
  }
}

/**
 * Assumes that the current trial (a single dot) has finished being rendered
 * and advances the calibration to the next dot if trials remain. Otherwise,
 * moves onto the next calibration round. If only 1 round of calibration, 
 * the calibration stage is finished.
 */
function finish_static_trial() {
  num_clicks_on_dot = 0;
  if (num_objects_shown === calibration_settings.num_trials) {
    calibration_current_round++;
    num_objects_shown = 0;
    heatmap_data_x = store_data.gaze_x.slice(0);
    heatmap_data_y = store_data.gaze_y.slice(0);

    // Check if we've finished all calibration rounds.
    if (calibration_current_round > calibration_settings.num_rounds) {
      finish_calibration();
    }
  } 
  else {
    start_calibration_task(); // Start another trial.
  }
}

/*******************************************************************************
 *                             PURSUIT CALIBRATION
 ******************************************************************************/

/**
 * Draw a moving dot. Used for calibration when the 'pursuit' stimulus 
 * is in effect.
 * @param {*} context - The 2D rendering context for the HTML5 canvas
 */
function draw_pursuit_dot_calibration(context) {
  if (num_objects_shown === calibration_settings.num_trials + 1) {
    finish_pursuit_round();
    return;
  }

  var dot = {
    x: curr_object.cx,
    y: curr_object.cy,
    r: DEFAULT_DOT_RADIUS
  };

  draw_dot(context, dot, 0);

  // Write the number of calibration dots remaining inside the enclosing circle
  draw_countdown_number(context, dot, calibration_settings.num_rounds, 
    calibration_settings.num_trials, num_objects_shown);

  // Set timeout so newly rendered dots pause before immediately moving
  if (interaction == "watch") {
    pursuit_watch_pause(context);
  }
  if (interaction == "click" || interaction === "placebo") {
    pursuit_click_pause(context);
  }
}

/**
 * Draws a calibration dot designed for the pursuit paradigm.
 * @param {*} context - The 2D rendering context for the HTML5 canvas
 */
function draw_new_moving_dot(context) {
  var now = new Date().getTime(),
    dt = now - (time_stamp || now);
  time_stamp = now;
  var angle = Math.atan2(
    curr_object.ty - curr_object.y,
    curr_object.tx - curr_object.x
  );

  var dist_per_frame =
    distance(curr_object.x, curr_object.y, curr_object.tx, curr_object.ty) /
    pursuit_paradigm_settings.dot_show_time *
    dt;

  var x_dist_per_frame = Math.cos(angle) * dist_per_frame;
  var y_dist_per_frame = Math.sin(angle) * dist_per_frame;
  curr_object.cx = curr_object.cx + x_dist_per_frame;
  curr_object.cy = curr_object.cy + y_dist_per_frame;

  var dot = {
    x: curr_object.cx,
    y: curr_object.cy,
    r: DEFAULT_DOT_RADIUS
  };

  if (distance(curr_object.cx, curr_object.cy, curr_object.tx, curr_object.ty) < dist_per_frame) {
    start_calibration_task();
  } 
  else {
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    draw_dot(context, dot, 0);
    draw_countdown_number(context, dot, 1, pursuit_paradigm_settings.num_trials, num_objects_shown);
    collect_training_data();
    request_anim_frame(draw_new_moving_dot);
  }
}

/**
 * Pauses for the duration of the fixation rest time before rendering a new dot.
 */
function pursuit_watch_pause(context) {
  setTimeout(function() {
    time_stamp = null;
    draw_new_moving_dot(context);
  }, pursuit_paradigm_settings.fixation_rest_time);
}

/**
 * Lingers on a paused dot until a click is detected.
 */
function pursuit_click_pause(context) {
  request_anim_frame(function() {
    if (num_objects_shown == 1 || num_clicks_on_dot > 0) {
      time_stamp = null;
      num_clicks_on_dot = 0;

      if (num_objects_shown === calibration_settings.num_trials + 1) {
        finish_pursuit_round();
      } 
      else {
        draw_new_moving_dot(context);
      }
    }
    else {
      draw_pursuit_dot_calibration(context);
    }
  });
}

/**
 * Assumes the number of calibration trials has been met and finishes this 
 * round of calibration.
 */
function finish_pursuit_round() {
  calibration_current_round++;
  num_objects_shown = 0;

  // Check if we've finished all calibration rounds
  if (calibration_current_round > calibration_settings.num_rounds) {
    finish_calibration();
  }
}
