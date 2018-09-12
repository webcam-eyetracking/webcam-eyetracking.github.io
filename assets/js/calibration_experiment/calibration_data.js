/******************************************************************************
 * STAGE 2 CALIBRATION EXPERIMENT
 * 
 * Functions responsible for recording the data from each of the calibration
 * conditions (+ 2 validation trials) and downloading them in csv format.
 ******************************************************************************/

var csv = "";

/**
 * The first set of data written to a file for the chosen condition. Includes
 * properties of window height/width as well as the interaction/stimulus of 
 * this condition.
 */
function write_calibration_data() {
  var canvas = document.getElementById("canvas-overlay");

  var rows = [
    'window height', 
    'window width', 
    'task', 
    'description',
    'elapsed time', 
    'gaze x calibration', 
    'gaze y calibration', 
    'object x calibration', 
    'object y calibration'
  ];

  var data = [
    [canvas.height],
    [canvas.width],
    [store_data.task + " " + interaction + "/" + stimuli],
    [store_data.description],
    store_data.elapsedTime,
    store_data.gaze_x,
    store_data.gaze_y,
    store_data.object_x,
    store_data.object_y
  ];

  for (let [index, val] of rows.entries()) {
    csv += val.toUpperCase() + "," + data[index].join(',');
    csv += "\n";
  }
}

/**
 * Appends data from the most recently completed validation task to the csv file
 * for this run.
 * @param {str} task_type: Either 'static' or 'pursuit'
 */
function write_validation_data(task_type) {
  csv += "\n\n";

  var rows = [
    'task', 
    'description', 
    'elapsed time', 
    'gaze x ' + task_type, 
    'gaze y ' + task_type, 
    'object x ' + task_type, 
    'object y ' + task_type
  ];

  var data = [
    [store_data.task],
    [store_data.description],
    store_data.elapsedTime,
    store_data.gaze_x,
    store_data.gaze_y,
    store_data.object_x,
    store_data.object_y
  ];

  for (let [index, val] of rows.entries()) {
    csv += val.toUpperCase() + "," + data[index].join(',');
    csv += "\n";
  }
}

/**
 * Downloads data from this run of a complete experiment to a CSV file.
 */
function download_csv() {
  var condition_id = get_anonymized_condition_id();
  var time_stamp = new Date().getTime();
  var file_name = "condition" + condition_id + "_" + time_stamp + ".csv";
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = file_name;
  hiddenElement.click();
}

/**
 * Takes the ongoing experimental condition and returns an ID for the 
 * purpose of anonymizing the data file's name from participants.
 * @return {str} A number from 1 to 6 with 'a' or 'b' appended
 */
function get_anonymized_condition_id() {
  var id = "";

  if (interaction == "watch" && stimuli == "static") {
    id += "1";
  }
  else if (interaction == "click" && stimuli == "static") {
    id += "2";
  }
  else if (interaction == "placebo" && stimuli == "static") {
    id += "3";
  }
  else if (interaction == "watch" && stimuli == "pursuit") {
    id += "4";
  }
  else if (interaction == "click" && stimuli == "pursuit") {
    id += "5";
  }
  else if (interaction == "placebo" && stimuli == "pursuit") {
    id += "6";
  }

  if (first_validation_task == "static") {
    id += "a";
  }
  else if (first_validation_task == "pursuit") {
    id += "b"
  }

  return id;
}

/**
 * Grabs a frame from the live WebGazer stream and saves the image as a raw 
 * PNG file.
 */
function save_webcam_frame() {
  var original_canvas = document.getElementById("webgazerVideoCanvas"),
      video_feed = document.querySelector("video"),

      // Get the exact size of the video element.
      width = video_feed.videoWidth,
      height = video_feed.videoHeight,

      // Context object for working with the canvas.
      context = original_canvas.getContext('2d');

  // console.log("video dimensions are " + width + " x " + height);

  // Set the canvas to the same dimensions as the video.
  original_canvas.width = width;
  original_canvas.height = height;

  // Draw a copy of the current frame from the video on the canvas.
  context.drawImage(video_feed, 0, 0, width, height);

  var dataURL = original_canvas.toDataURL('image/png');
  var hiddenElement = document.createElement('a');
  hiddenElement.href = dataURL;
  hiddenElement.target = '_blank';
  hiddenElement.download = get_webcam_screenshot_name();
  hiddenElement.click();
}

/**
 * Generates the name of the current webcam snapshot.
 * @return {str} name of the .png file
 */
function get_webcam_screenshot_name() {
  var condition_id = get_anonymized_condition_id();
  var time_stamp = new Date().getTime();
  var paradigm_id = paradigm[0]; // (calibration, static, pursuit, final)
  return "webcam_" + condition_id + "_" + paradigm_id + "_" + time_stamp + ".png";
}