/************************************
 * COMMON FUNCTIONS
 ************************************/
/*jshint esversion: 6 */

/**
 * Shuffles an array in place; i.e. the input array will be shuffled as well.
 * 
 * @param {*} array - The input array to be shuffled
 * @author http://stackoverflow.com/a/2450976/4175553
 * @return - The shuffled array
 */
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

/**
 * Get the distance between two points with position (x1,y1) and (x2,y2)
 * 
 * @param {*} x1
 * @param {*} y1
 * @param {*} x2
 * @param {*} y2
 */
function distance(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  return parseInt(Math.sqrt(a * a + b * b));
}

/***************************************************
 * Functions that interact with the HTML DOM or CSS.
 ***************************************************/

/**
 * Clear content of canvas.
 */
function clear_canvas(canvas_id = "canvas-overlay") {
  var canvas = document.getElementById(canvas_id);
  var context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Darken background so tasks such as calibration are easier on the eyes.
 */
function darken_canvas(canvas_id = "canvas-overlay") {
  var canvas = document.getElementById(canvas_id);
  canvas.style.backgroundColor = DARK_BG_COLOR;
}

/**
 * Lighten canvas for screens involving reading text, viewing heatmaps, etc.
 */
function lighten_canvas(canvas_id = "canvas-overlay") {
  var canvas = document.getElementById(canvas_id);
  canvas.style.backgroundColor = MAIN_BG_COLOR;
}

/**
 * Returns the context of the HTML5 canvas.
 */
function get_context(canvas_id = "canvas-overlay") {
  var canvas = document.getElementById(canvas_id);
  var context = canvas.getContext("2d");
  return context;
}

/**
 * Deletes HTML element with the given ID.
 * 
 * @param {str} id - id of the element
 */
function delete_elem(id) {
  var elem = document.getElementById(id);
  if (elem) {
    elem.parentNode.removeChild(elem);
  }
}

/**
 * Gets HTML element from a point.
 * 
 * @param {*} x - x_coordinate of point
 * @param {*} y - y_coordinate of point
 */
function get_elements_seen(x, y) {
  var element = document.elementFromPoint(x, y);
  if (element in elem_array) {
    elem_array[element] = elem_array[element] + 1;
  } else {
    elem_array[element] = 1;
  }
}

/**
 * Toggle the stylesheets of the websites so that we can override the attributes
 * and styling of the webpage. Used to keep the style and attributes of our 
 * system in check.
 */
function toggle_stylesheets() {
  for (i = 0; i < document.styleSheets.length; i++) {
    document.styleSheets[i].disabled = !document.styleSheets[i].disabled;
  }
}
/**
 * Enable the stylesheet of our system.
 */
function enable_medusa_stylesheet() {
  document.styleSheets[document.styleSheets.length - 1].disabled = false;
}

/**
 * Create the overlay over the website.
 */
function create_overlay() {
  toggle_stylesheets();
  enable_medusa_stylesheet();
  var canvas = document.createElement("canvas");
  canvas.id = "canvas-overlay";

  // Style the newly created canvas
  canvas.style.zIndex = 10;
  canvas.style.position = "fixed";
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.backgroundColor = MAIN_BG_COLOR;

  // Add the canvas to web page
  window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  document.body.appendChild(canvas);
}

/**
 * Create the overlay over the website.
 */
function show_canvas_overlay() {
  var canvas = document.getElementById("canvas-overlay");
  $("#canvas-overlay").show();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Add the canvas to web page
  window.addEventListener("resize", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function hide_canvas_overlay() {
  $("#canvas-overlay").hide();
}

function show_heatmap_instruction(function_name) {
  webgazer.pause();
  heatmap_data_x = store_data.gaze_x.slice(0);
  heatmap_data_y = store_data.gaze_y.slice(0);
  $("#heatmap_instruction").show();
  hide_canvas_overlay();
  clear_canvas("heatmap-overlay");
  setTimeout(function() {
    show_heatmap_text(function_name);
  }, SCREEN_TIMEOUT);
}

/**
 * Show the video feed.
 */
function show_video_feed() {
  webgazer.resume();
  hide_face_tracker();
  var video = document.getElementById("webgazerVideoFeed");
  video.style.display = "block";
  video.style.position = "fixed";
  video.style.top = "65%";
  video.style.left = "calc(50% - " + (cam_width / 2).toString() + "px)";
  video.width = cam_width;
  video.height = cam_height;
  video.style.margin = "0px";
  video.style.zIndex = 13;

  webgazer.params.imgWidth = cam_width;
  webgazer.params.imgHeight = cam_height;

  var overlay = document.createElement("canvas");
  overlay.id = "face_tracker";
  overlay.style.position = "fixed";
  overlay.width = cam_width;
  overlay.height = cam_height;
  overlay.style.top = "65%";
  overlay.style.left = "calc(50% - " + (cam_width / 2).toString() + "px)";
  overlay.style.margin = "0px";
  overlay.style.zIndex = 14;
  document.body.appendChild(overlay);
  face_tracker = requestAnimFrame(show_face_tracker);
}

/**
 * A backward compatibility version of request animation frame
 * @author http://www.html5canvastutorials.com/advanced/html5-canvas-animation-stage/
 */
window.request_anim_frame = (function (callback) {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 30);
    }
  );
})();

/************************************************************
 * Functions that assist with setting up the calibration dots.
 ************************************************************/

/**
 * Dot object
 * 
 * @param {num} x - x_coordinate of the center
 * @param {num} y - y_coordinate of the center
 * @param {num} r - radius
 */
var Dot = function(x, y, r) {
  r = typeof r !== "undefined" ? r : DEFAULT_DOT_RADIUS;
  this.x = x;
  this.y = y;
  this.r = r;
  this.left = x - r;
  this.top = y - r;
  this.right = x + r;
  this.bottom = y + r;
  this.hit_count = 0;
};

/**
 * Create an array of dots from an array of positions.
 * 
 * @param {*} pos_array - array of positions
 * @param {bool} randomize - whether the array should be shuffled
 * @return {*} dot_array - the array of dots
 */
function create_dot_array(pos_array, randomize) {
  var canvas = document.getElementById("canvas-overlay");
  var dot_array = [];
  for (var dot_pos in pos_array) {
    dot_array.push(
      new Dot(
        canvas.width * pos_array[dot_pos][0],
        canvas.height * pos_array[dot_pos][1],
        DEFAULT_DOT_RADIUS
      )
    );
  }

  return randomize ? shuffle(dot_array) : dot_array;
}

/****************************************************
 * Functions that interact with the database.
 ****************************************************/

/**
 * Reset the store_data variable.
 */
function reset_store_data(callback) {
  store_data = {
    task: "", // the current performing task
    description: "", // a description of the task. Depends on the type of task
    elapsedTime: [], // time since webgazer.begin() is called
    object_x: [], // x position of whatever object the current task is using
    object_y: [], // y position of whatever object the current task is using
    gaze_x: [], // x position of gaze
    gaze_y: [] // y position of gaze
  };
  if (callback !== undefined) callback();
}

/**
 * Send gaze data to database and then clear out the store_data variable. 
 * Called after each step.
 */
function send_gaze_data_to_database(callback) {
  var canvas = document.getElementById("canvas-overlay");
  var context = canvas.getContext("2d");

  var temp_store_data = {
    task: "", // the current performing task
    url: "", // url of website
    canvasWidth: "", // the width of the canvas
    canvasHeight: "", // the height of the canvas
    description: "", // a description of the task. Depends on the type of task
    elapsedTime: [], // time since webgazer.begin() is called
    object_x: [], // x position of whatever object the current task is using
    object_y: [], // y position of whatever object the current task is using
    gaze_x: [], // x position of gaze
    gaze_y: [] // y position of gaze
  };

  temp_store_data.url = window.location.href;
  temp_store_data.canvasHeight = canvas.height;
  temp_store_data.canvasWidth = canvas.width;
  temp_store_data.task = store_data.task;
  temp_store_data.description = store_data.description;

  if (current_task === "calibration") {
    temp_store_data.gaze_x = [0];
    temp_store_data.gaze_y = [0];
    temp_store_data.object_x = [0];
    temp_store_data.object_y = [0];
    temp_store_data.elapsedTime = [0];
  } else {
    temp_store_data.gaze_x = store_data.gaze_x;
    temp_store_data.gaze_y = store_data.gaze_y;
    temp_store_data.object_x = store_data.object_x;
    temp_store_data.object_y = store_data.object_y;
    temp_store_data.elapsedTime = store_data.elapsedTime;
  }

  var params = {
    TableName: TABLE_NAME,
    Item: {
      gazer_id: gazer_id,
      time_collected: session_time,
      info: temp_store_data
    }
  };

  docClient.put(params, function (err, data) {
    if (err) {
      console.log(
        "Unable to add item: " + "\n" + JSON.stringify(err, undefined, 2)
      );
    } else {
      console.log(
        "PutItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2)
      );
      callback;
    }
  });
}

/**
 * Sends user data to the database. Only called at the end of the experiment.
 */
function send_user_data_to_database(callback) {
  session_time = new Date().getTime().toString();
  var empty_count = 0;

  $("select").each(function (i) {
    if (this.value === "") {
      empty_count += 1;
      this.style.boxShadow = "0 0 5px 1px var(--submit-color-darker)";
      this.onfocus = function () {
        this.style.boxShadow = "none";
      };
    }
  });

  if (empty_count === 1) {
    document.getElementById("survey_info").innerHTML =
      "There is only one more thing you need to fill out";
    return;
  } else if (empty_count > 1) {
    document.getElementById("survey_info").innerHTML =
      "There are " +
      empty_count.toString() +
      " more things you need to fill out.";
    return;
  }

  user.age = document.getElementById("age").value;
  user.gender = document.getElementById("gender").value;
  user.current_country = document.getElementById("current_country").value;
  user.main_country = document.getElementById("main_country").value;
  user.main_hand = document.getElementById("handedness").value;
  user.education_level = document.getElementById("education_level").value;
  user.eye_sight = document.getElementById("vision").value;
  user.performance = document.getElementById("performance").value;
  user.comment = document.getElementById("comment").value;

  if (user.comment === "") {
    user.comment = "none";
  }

  var params = {
    TableName: USER_TABLE_NAME,
    Item: {
      gazer_id: gazer_id,
      time_collected: session_time,
      info: user
    }
  };

  // toggle_stylesheets();
  docClient.put(params, function (err, data) {
    if (err) {
      console.log(
        "Unable to add item: " + "\n" + JSON.stringify(err, undefined, 2)
      );
    } else {
      // console.log(
      //   "PutItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2)
      // );
    }
    callback();
  });
}

/*********************************************
 * Functions that draw on the HTML5 canvas.
 *********************************************/

 /**
 * Draw the track around a dot
 * @param {*} context - context of the canvas to draw
 * @param {*} dot - the Dot object
 */
function draw_track(context, dot, color) {
  context.beginPath();
  context.arc(dot.x, dot.y, dot.r, 0, 2 * Math.PI);
  context.strokeStyle = color;
  context.lineWidth = 1;
  context.fillStyle = DOT_CENTER_COLOR;
  context.fill();
}

/**
 * Draw the fixation cross on the middle of the screen.
 */
function draw_fixation_cross(midX, midY, canvas_object) {
  clear_canvas();
  var context = canvas_object.getContext("2d");
  context.strokeStyle = "white";
  context.lineWidth = 5;

  // Draw horizontal line
  context.beginPath();
  context.moveTo(midX - 15, midY);
  context.lineTo(midX + 15, midY);
  context.stroke();

  // Draw vertical line
  context.beginPath();
  context.moveTo(midX, midY - 15);
  context.lineTo(midX, midY + 15);
  context.stroke();
}

/**
 * Renders a dot for eyetracking calibration.
 *
 * @param {*}   context - The 2D rendering context for the HTML5 canvas
 * @param {Dot} dot - The current object
 * @param {num} arclen - Proportion of the dot's encircling arc to remove
 */
function draw_dot(context, dot, arc_len) {
  clear_canvas();
  draw_track(context, dot); // Base circle
  context.lineWidth = 7;
  context.beginPath();
  context.strokeStyle = DOT_COLOR;
  context.arc( // Animated ring around circle
    dot.x,
    dot.y,
    dot.r,
    Math.PI / -2,
    Math.PI * 3 / 2 - arc_len,
    false
  );
  context.stroke();
}

/**
 * Draws a calibration dot designed for the simple paradigm.
 * 
 * @param {*}   context - The 2D rendering context for the HTML5 canvas
 * @param {Dot} dot - The current object
 */
function draw_simple_dot(context, dot) {
  var time = new Date().getTime();
  var delta = time - time_stamp;
  var arc_len = delta * Math.PI * 2 / simple_paradigm_settings.dot_show_time;
  draw_dot(context, dot, arc_len);

  // Write the number of calibration dots remaining inside the enclosing circle
  draw_countdown_number(context, dot, 1, simple_paradigm_settings.num_trials, num_objects_shown);

  request_anim_frame(function() {
    if (delta >= simple_paradigm_settings.dot_show_time) {
      return;
    } else {
      draw_simple_dot(context, dot);
    }
  });
}

/**
 * Draws a calibration dot designed for the pursuit paradigm.
 *
 * @param {*} context - The 2D rendering context for the HTML5 canvas
 */
function draw_moving_dot(context) {
  if (current_task !== "pursuit_paradigm") return;

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

  if (distance(curr_object.cx, curr_object.cy, curr_object.tx, curr_object.ty) < 40) {
    loop_pursuit_paradigm();
    return;
  } else {
    draw_dot(context, dot, 0);
    draw_countdown_number(context, dot, 1, pursuit_paradigm_settings.num_trials, num_objects_shown);
    request_anim_frame(draw_moving_dot);
  }
}

/**
 * Renders the 'countdown' (total number of calibration trials remaining)
 * as text within the calibration dot.
 * 
 * @param {*}   context - The 2D rendering context for the HTML5 canvas
 * @param {Dot} dot - The current object
 * @param {num} num_rounds - Full rounds of calibration
 * @param {num} num_trials - Calibration dots shown per round
 * @param {num} num_objects_shown - Dots already shown during **this round**
 */
function draw_countdown_number(context, dot, num_rounds, num_trials, num_objects_shown) {
  // Set styling
  context.font = FONT_FAMILY;
  context.fillStyle = DOT_COLOR;
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Display the actual number of dots left
  var actual_num_objs_shown = (calibration_current_round - 1) * num_trials +
    num_objects_shown;
  var countdown = num_rounds * num_trials - actual_num_objs_shown;
  context.fillText(
    countdown + 1, // plus 1 to offset any user confusion from zero-based indexing
    dot.x, 
    dot.y
  );
}

/**
 * Renders the currently chosen MASSVIS image.
 * @param {bool} heatmap_toggle: Whether image is being drawn underneath a heatmap.
 */
function draw_massvis_image(heatmap_toggle) {
  var canvas = document.getElementById("canvas-overlay");
  var context = canvas.getContext("2d");
  var aspect_ratio = curr_object.width / curr_object.height;
  if (
    curr_object.width >= canvas.width ||
    curr_object.height >= canvas.height
  ) {
    var heightmajor_height =
      canvas.height - massvis_paradigm_settings.spacing * 2;
    var heightmajor_width = aspect_ratio * heightmajor_height;
    var widthmajor_width = canvas.width - massvis_paradigm_settings.spacing * 2;
    var widthmajor_height = widthmajor_width / aspect_ratio;
    if (
      heightmajor_height < canvas.height &&
      heightmajor_width < canvas.width
    ) {
      curr_object.width = heightmajor_width;
      curr_object.height = heightmajor_height;
    } else if (
      widthmajor_width < canvas.width &&
      widthmajor_height < canvas.height
    ) {
      curr_object.width = widthmajor_width;
      curr_object.height = widthmajor_height;
    }
  }
  curr_object.onload = context.drawImage(
    curr_object,
    canvas.width / 2 - curr_object.width / 2,
    canvas.height / 2 - curr_object.height / 2,
    curr_object.width,
    curr_object.height
  );

  // Save fresh image data for later use
  if (!heatmap_toggle) {
    var imageData = context.getImageData(
      canvas.width / 2 - curr_object.width / 2,
      canvas.height / 2 - curr_object.height / 2,
      curr_object.width,
      curr_object.height);

    curr_object.origImageData = imageData;
  }
}

/**
 * Show the face tracker onscreen.
 */
function show_face_tracker() {
  face_tracker = requestAnimFrame(show_face_tracker);
  var overlay = document.getElementById("face_tracker");
  var cl = webgazer.getTracker().clm;
  overlay.getContext("2d").clearRect(0, 0, cam_width, cam_height);
  if (cl.getCurrentPosition()) {
    cl.draw(overlay);
  }
}

/**
 * Hide the face tracker from the user.
 */
function hide_face_tracker() {
  delete_elem("face_tracker");
  var video = document.getElementById("webgazerVideoFeed");
  video.style.display = "None";
  cancelAnimationFrame(face_tracker);
}
