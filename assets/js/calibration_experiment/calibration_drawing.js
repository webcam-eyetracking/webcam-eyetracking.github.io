/******************************************************************************
 * STAGE 2 CALIBRATION EXPERIMENT
 * 
 * Functions responsible for rendering the calibration dots presented to
 * participants to gather training data.
 ******************************************************************************/

/**
 * For static calibration tasks, dots have a receding ring (arc) around them
 * as a visual indicator of remaining screentime.
 * @return {int} the proportion of the arc to be REMOVED from the ring
 */
function get_arc_length() {
  if (interaction === "click") {
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
 * Draw a stationary dot with a countdown number inside. Used for 
 * calibration when the 'static' stimulus is in effect.
 * @param {*} context - The 2D rendering context for the HTML5 canvas
 * @param {*} dot - The current object
 */
function draw_static_dot_calibration(context, dot) {
  draw_dot(context, dot, get_arc_length());

  // Write the number of calibration dots remaining inside the enclosing circle
  draw_countdown_number(context, dot, calibration_settings.num_rounds, 
    calibration_settings.num_trials, num_objects_shown);

  request_anim_frame(function() {
    // Check exit round conditions for each calibration mode
    if ((interaction === "watch" && delta >= calibration_settings.dot_show_time) ||
        (interaction === "click" && num_clicks_on_dot === calibration_settings.max_num_clicks)) {
      if (num_objects_shown === calibration_settings.num_trials) {
        calibration_current_round++;
        num_objects_shown = 0;
        heatmap_data_x = store_data.gaze_x.slice(0);
        heatmap_data_y = store_data.gaze_y.slice(0);
        return;
      } 
      else {
        create_new_dot_calibration();
        return;
      }
    }
    draw_static_dot_calibration(context, dot);
  });
}

/**
 * Draw a moving dot. Used for calibration when the 'tracking' stimulus 
 * is in effect.
 * @param {*} context - The 2D rendering context for the HTML5 canvas
 * @param {*} dot - The current object
 */
function draw_tracking_dot_calibration(context, dot) {
  // Check exit condition
  if (num_objects_shown === calibration_settings.num_trials) {
    num_objects_shown = 0;
    calibration_current_round++;
    heatmap_data_x = store_data.gaze_x.slice(0);
    heatmap_data_y = store_data.gaze_y.slice(0);
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
  setTimeout(function() {
    time_stamp = null;
    draw_moving_calibration_dot(context);
  }, pursuit_paradigm_settings.fixation_rest_time);
 }

/**
 * Draws a calibration dot designed for the pursuit paradigm.
 *
 * @param {*} context - The 2D rendering context for the HTML5 canvas
 */
function draw_moving_calibration_dot(context, dot) {
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

  dot = {
    x: curr_object.cx,
    y: curr_object.cy,
    r: DEFAULT_DOT_RADIUS
  };

  if (distance(curr_object.cx, curr_object.cy, curr_object.tx, curr_object.ty) < 40) {
    start_calibration_task();
    return;
  } else {
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    clear_canvas();
    draw_dot(context, dot, 0);
    draw_countdown_number(context, dot, 1, pursuit_paradigm_settings.num_trials, num_objects_shown);
    collect_training_data(); // Be more consistent with collecting data here
    request_anim_frame(draw_moving_calibration_dot);
  }
}
