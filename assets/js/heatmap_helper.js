/************************************
 * HEATMAP HELPER
 * A set of functions that controls the rendering and mouseover toggle of 
 * the heatmap visualization tool.
 ************************************/

var mouseover = false;
var heat;

/**
 * Displays text for the heatmap reveal.
 */
function show_heatmap_text(function_name) {
  // Skip if heatmaps are set to not display.
  if (!SHOW_HEATMAPS) {
    lighten_canvas();
    window[function_name]();
    return;
  }

  webgazer.pause();
  collect_data = false;
  clear_canvas();
  lighten_canvas();

  var instruction = document.createElement("div");
  instruction.id = "instruction";
  instruction.className += "overlay-div";
  instruction.style.zIndex = 99;
  instruction.innerHTML +=
    '<header class="form__header">' +
    '<h2 class="form__title">Here is a heatmap of where we think you were looking. <br> Press the NEXT button when you are done.</h2>' +
    "</header>";
  document.body.appendChild(instruction);

  setTimeout(draw_heatmap(function_name), screen_timeout);
}

/**
 * Renders the heatmap using the simpleheat library.
 */
function draw_heatmap(function_name) {
  delete_elem("instruction");
  var canvas = document.createElement("canvas");
  canvas.id = "heatmap-overlay";
  var context = get_context();

  // Style the newly created canvas
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
  button.innerHTML = "Next";
  button.style.position = "absolute";
  button.style.zIndex = 99;
  button.addEventListener("click", function () {
    window[function_name]();
    delete_elem("heatmap-button");
    delete_elem("heatmap-overlay");
  });
  button.onmouseover = function () {
    button.style.opacity = 1;
  };
  button.onmouseout = function () {
    button.style.opacity = 0.5;
  };
  document.body.appendChild(button);

  heat = simpleheat(canvas);
  var points = [];
  for (i = 0; i < heatmap_data_x.length; i++) {
    var point = [heatmap_data_x[i], heatmap_data_y[i], 0.1];
    points.push(point);
  }

  clear_canvas();
  heat.data(points);
  heat.draw();
  context = get_context("heatmap-overlay");
  // Save imageData of this heatmap
  heatmap_image_data = context.getImageData(
    canvas.width / 2 - curr_object.width / 2,
    canvas.height / 2 - curr_object.height / 2,
    curr_object.width,
    curr_object.height);

  if (current_task === "massvis_paradigm") {
    // Draw the original MASSVIS image under the heatmap for reference
    draw_massvis_image(true);
    // Add an event handler to toggle a different visualization
    // canvas.addEventListener("mouseover", heatmap_mouseover, false);
    $("#" + canvas.id).on("mouseover mouseout", heatmap_mouseover);
    // Trace heatmap on top of image
    heat.draw();
  }

  if (current_task === "static") {
    for (i = 0; i < simple_paradigm_settings.position_array.length; i++) {
      var midX = simple_paradigm_settings.position_array[i][0] * canvas.width;
      var midY =
        simple_paradigm_settings.position_array[i][1] * canvas.height;
      draw_fixation_cross(midX, midY, canvas);
    }
  }

  else if (current_task === "pursuit_end") {
    draw_fixation_cross(canvas.width * 0.2, canvas.height * 0.2, canvas);
    draw_fixation_cross(canvas.width * 0.8, canvas.height * 0.2, canvas);
    draw_fixation_cross(canvas.width * 0.2, canvas.height * 0.8, canvas);
    draw_fixation_cross(canvas.width * 0.8, canvas.height * 0.8, canvas);
  }

  else if (current_task === "calibration" || current_task === "validation") {
    for (i = 0; i < calibration_settings.position_array.length; i++) {
      midX = calibration_settings.position_array[i][0] * canvas.width;
      midY = calibration_settings.position_array[i][1] * canvas.height;
      draw_fixation_cross(midX, midY, canvas);
    }
    draw_fixation_cross(canvas.width * 0.5, canvas.height * 0.5, canvas);
  }

  else if (current_task === "bonus") {
    if (current_task === "bonus") {
      var prev_height = curr_object.height;
      var prev_width = curr_object.width;
      var src =
        curr_object.src.slice(0, curr_object.src.length - 4) + " answer.jpg";
      curr_object = new Image();
      curr_object.src = src;
      curr_object.height = prev_height;
      curr_object.width = prev_width;
    }
    canvas = document.getElementById("canvas-overlay");
    context = canvas.getContext("2d");
    curr_object.onload = function () {
      context.drawImage(
        curr_object,
        canvas.width / 2 - curr_object.width / 2,
        canvas.height / 2 - curr_object.height / 2,
        curr_object.width,
        curr_object.height
      );
    };
  }
}

/**
 * Toggles between a standard heatmap overlay and a "spyglass" visual effect
 * that highlights where the user was looking.
 */
function heatmap_mouseover() {
  mouseover = !mouseover;

  var canvas = document.getElementById("canvas-overlay");
  var context = canvas.getContext("2d");
  clear_canvas();

  var imageX = canvas.width / 2 - curr_object.width / 2;
  var imageY = canvas.height / 2 - curr_object.height / 2;
  var massvis_image_data = copyImageData(context, curr_object.origImageData);
  var massvis_pixels = massvis_image_data.data;
  var heatmap_pixels = heatmap_image_data.data;

  if (mouseover) { // Dim any image regions that were unobserved by the user

    for (var i = 0; i < massvis_pixels.length; i += 4) {
      // Don't obfuscate regions with heatmap 'hot spots'
      if (heatmap_pixels[i] == 255) {
        continue;
      }

      // Set the alpha value
      massvis_pixels[i + 3] = Math.max((heatmap_pixels[i] / 255), heatmap_pixels[i + 3]);
      
      var heatmap_rgb = heatmap_pixels.slice(i, i + 3);
      var adjustment_pct = 1 + get_image_fade_pct(heatmap_rgb);

      // Lighten colors so they have the effect of 'fading' when the heatmap was weak
      massvis_pixels[i] = massvis_pixels[i] * adjustment_pct;
      massvis_pixels[i + 1] = massvis_pixels[i + 1] * adjustment_pct;
      massvis_pixels[i + 2] = massvis_pixels[i + 2] * adjustment_pct;
    }

    massvis_image_data.data.set(massvis_pixels);
    clear_canvas("heatmap-overlay");
  } else { // Mouseout; restore the heatmap view
    massvis_image_data = curr_object.origImageData;
    heat.draw();
  }

  // Overwrite original image
  context.putImageData(massvis_image_data, imageX, imageY);
}

/**
 * Uses the RGB values from a heatmap pixel to determine how much the original 
 * image should be obfuscated. For example, a very faint (light blue) heatmap 
 * would yield a fainter image.
 * @param {int array} heatmap_rgb
 */
function get_image_fade_pct(heatmap_rgb) {
  var red = heatmap_rgb[0];
  var green = heatmap_rgb[1];
  var blue = heatmap_rgb[2];

  // RGB max val is 255. The further we deviate from this, the dimmer the result.
  var fade_pct = (255 - red) / 255;

  // Green/blue values are weighted less heavily
  fade_pct -= (green / 255) * 1.4;
  fade_pct -= (blue / 255) * 1.1;

  return Math.max(fade_pct, 0);
}

/**
 * Returns true if the mouse coordinates are positioned over the displayed
 * MASSVIS image.
 * @param {int} mouseX: The x-coordinate of the mouse during the event trigger
 * @param {int} mouseY: The y-coordinate of the mouse during the event trigger
 * @param {int} imageX: The leftmost x-coordinate of the massvis image
 * @param {int} imageY: The topmost y-coordinate of the massvis image
 */
function mouseover_is_valid(mouseX, mouseY, imageX, imageY) {
  return (mouseX >= imageX) && (mouseX <= imageX + curr_object.width) &&
         (mouseY >= imageY) && (mouseY <= imageY + curr_object.height);
}

/**
 * Returns a deep copy of the given imageData object.
 */
function copyImageData(context, src) {
  var dst = context.createImageData(curr_object.width, curr_object.height);
  dst.data.set(src.data);
  return dst;
}