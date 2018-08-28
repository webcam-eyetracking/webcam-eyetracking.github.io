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

  var rows = ['task', 'description', 'elapsed time', 'gaze x ' + task_type, 
    'gaze y ' + task_type, 'object x ' + task_type, 'object y ' + task_type];

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
  var file_name = interaction + "_" + stimuli + ".csv";
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = file_name;
  hiddenElement.click();
}
