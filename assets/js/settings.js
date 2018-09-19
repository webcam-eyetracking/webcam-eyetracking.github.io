
/************************************
 * AMAZON KEYS
 ************************************/
var IdentityPoolId = 'us-east-2:8ee03ba3-a31d-4414-882a-a7a83917a5be';
var RoleArn = "arn:aws:iam::345518382834:role/Cognito_medusaUnauth_Role";

/************************************
 * CONSTANTS
 ************************************/
const TABLE_NAME = "GAZE_DATA"; // name of data table of gaze data
const USER_TABLE_NAME = "USERS"; // name of data table of users
const DEFAULT_DOT_RADIUS = 20;
const SAMPLING_RATE = 5; // number of calls to function once webgazer got data per second
const SHOW_HEATMAPS = false; // toggle for revealing heatmap feedback to participants

/************************************
 * STYLING
 ************************************/
var MAIN_BG_COLOR = "#F5F5F5"; // light gray
var DARK_BG_COLOR = "#666F74"; // dark gray
var FONT_COLOR = "#585858";
var DOT_COLOR = "#F7B2C2";
var DOT_CENTER_COLOR = "#929292";
var FONT_FAMILY = "20px Source Sans Pro";

/************************************
 * DOT POSITION CONSTANTS
 ************************************/
 // (As ratios of screen width and height)
 var LEFT_EDGE_POS = 0.035;
 var TOP_EDGE_POS = 0.035;
 var RIGHT_EDGE_POS = 0.965;
 var BOTTOM_EDGE_POS = 0.965;
 var CENTER_POS = 0.5;

/************************************
 * CALIBRATION PARAMETERS
 ************************************/
var calibration_settings = {
  dot_show_time: 2500, // duration of a single position sampled
  num_rounds: 1, // the number of calibration rounds
  num_trials: 14, // the number of dots used for calibration
  distance: 200, // radius of acceptable gaze data around calibration dot
  max_num_clicks: 5, // number of clicks during manual calibration mode
  position_array: [ // array of positions
    [CENTER_POS, CENTER_POS],
    [LEFT_EDGE_POS, TOP_EDGE_POS],
    [RIGHT_EDGE_POS, TOP_EDGE_POS],
    [LEFT_EDGE_POS, BOTTOM_EDGE_POS],
    [RIGHT_EDGE_POS, BOTTOM_EDGE_POS],
    [CENTER_POS, TOP_EDGE_POS],
    [LEFT_EDGE_POS, CENTER_POS],
    [RIGHT_EDGE_POS, CENTER_POS],
    [CENTER_POS, BOTTOM_EDGE_POS],
    [CENTER_POS / 2, CENTER_POS / 2],
    [CENTER_POS * 1.5, CENTER_POS / 2],
    [CENTER_POS / 2, CENTER_POS * 1.5],
    [CENTER_POS * 1.5, CENTER_POS * 1.5],
    [CENTER_POS, CENTER_POS]
  ]
};

/************************************
 * STATIC (SIMPLE) PARADIGM PARAMETERS
 ************************************/
var simple_paradigm_settings = {
  position_array: [
    [CENTER_POS, CENTER_POS],
    [LEFT_EDGE_POS, TOP_EDGE_POS],
    [RIGHT_EDGE_POS, TOP_EDGE_POS],
    [LEFT_EDGE_POS, BOTTOM_EDGE_POS],
    [RIGHT_EDGE_POS, BOTTOM_EDGE_POS],
    [CENTER_POS, TOP_EDGE_POS],
    [LEFT_EDGE_POS, CENTER_POS],
    [RIGHT_EDGE_POS, CENTER_POS],
    [CENTER_POS, BOTTOM_EDGE_POS],
    [CENTER_POS / 2, CENTER_POS / 2],
    [CENTER_POS * 1.5, CENTER_POS / 2],
    [CENTER_POS / 2, CENTER_POS * 1.5],
    [CENTER_POS * 1.5, CENTER_POS * 1.5],
    [CENTER_POS, CENTER_POS]
  ],
  num_trials: 14,
  fixation_rest_time: 1500, // amount of time crosshair will appear on screen with each trial, in ms
  dot_show_time: 2500 // amount of time dot will appear on screen with each trial, in ms
};

/************************************
 * PURSUIT PARADIGM PARAMETERS
 ************************************/
var pursuit_paradigm_settings = {
  position_array: [{
      x: 0.2,
      y: 0.2,
      tx: 0.8,
      ty: 0.2
    },
    {
      x: 0.8,
      y: 0.2,
      tx: 0.2,
      ty: 0.2
    },
    {
      x: 0.2,
      y: 0.2,
      tx: 0.2,
      ty: 0.8
    },
    {
      x: 0.2,
      y: 0.8,
      tx: 0.2,
      ty: 0.2
    },
    {
      x: 0.2,
      y: 0.2,
      tx: 0.8,
      ty: 0.8
    },
    {
      x: 0.8,
      y: 0.8,
      tx: 0.2,
      ty: 0.8
    },
    {
      x: 0.2,
      y: 0.8,
      tx: 0.8,
      ty: 0.2
    },
    {
      x: 0.8,
      y: 0.2,
      tx: 0.2,
      ty: 0.8
    },
    {
      x: 0.2,
      y: 0.8,
      tx: 0.8,
      ty: 0.8
    },
    {
      x: 0.8,
      y: 0.8,
      tx: 0.8,
      ty: 0.2
    },
    {
      x: 0.8,
      y: 0.2,
      tx: 0.8,
      ty: 0.8
    },
    {
      x: 0.8,
      y: 0.8,
      tx: 0.2,
      ty: 0.8
    },
    {
      x: 0.2,
      y: 0.8,
      tx: 0.2,
      ty: 0.2
    },
    {
      x: 0.2,
      y: 0.2,
      tx: 0.8,
      ty: 0.2
    }
  ],
  num_trials: 14,
  dot_show_time: 1000,
  fixation_rest_time: 1500
};

/************************************
 * MASSVIS_PARADIGM PARAMETERS
 ************************************/
var massvis_paradigm_settings = {
  image_array: [
    "../assets/images/vis/economist_daily_chart_103.png",
    "../assets/images/vis/economist_daily_chart_106.png",
    "../assets/images/vis/economist_daily_chart_110.png",
    "../assets/images/vis/economist_daily_chart_116.png",
    "../assets/images/vis/economist_daily_chart_124.png",
    "../assets/images/vis/economist_daily_chart_129.png",
    "../assets/images/vis/economist_daily_chart_153.png",
    "../assets/images/vis/economist_daily_chart_165.png",
    "../assets/images/vis/economist_daily_chart_167.png",
    "../assets/images/vis/economist_daily_chart_18.png",
    "../assets/images/vis/economist_daily_chart_187.png",
    "../assets/images/vis/economist_daily_chart_202.png",
    "../assets/images/vis/economist_daily_chart_215.png",
    "../assets/images/vis/economist_daily_chart_219.png",
    "../assets/images/vis/economist_daily_chart_240.png",
    "../assets/images/vis/economist_daily_chart_242.png",
    "../assets/images/vis/economist_daily_chart_258.png",
    "../assets/images/vis/economist_daily_chart_268.png",
    "../assets/images/vis/economist_daily_chart_310.png",
    "../assets/images/vis/economist_daily_chart_317.png",
    "../assets/images/vis/economist_daily_chart_324.png",
    "../assets/images/vis/economist_daily_chart_35.png",
    "../assets/images/vis/economist_daily_chart_380.png",
    "../assets/images/vis/economist_daily_chart_390.png",
    "../assets/images/vis/economist_daily_chart_392.png",
    "../assets/images/vis/economist_daily_chart_4.png",
    "../assets/images/vis/economist_daily_chart_406.png",
    "../assets/images/vis/economist_daily_chart_416.png",
    "../assets/images/vis/economist_daily_chart_430.png",
    "../assets/images/vis/economist_daily_chart_439.png",
    "../assets/images/vis/economist_daily_chart_449.png",
    "../assets/images/vis/economist_daily_chart_45.png",
    "../assets/images/vis/economist_daily_chart_453.png",
    "../assets/images/vis/economist_daily_chart_454.png",
    "../assets/images/vis/economist_daily_chart_46.png",
    "../assets/images/vis/economist_daily_chart_475.png",
    "../assets/images/vis/economist_daily_chart_48.png",
    "../assets/images/vis/economist_daily_chart_490.png",
    "../assets/images/vis/economist_daily_chart_491.png",
    "../assets/images/vis/economist_daily_chart_493.png",
    "../assets/images/vis/economist_daily_chart_5.png",
    "../assets/images/vis/economist_daily_chart_516.png",
    "../assets/images/vis/economist_daily_chart_520.png",
    "../assets/images/vis/economist_daily_chart_521.png",
    "../assets/images/vis/economist_daily_chart_529.png",
    "../assets/images/vis/economist_daily_chart_53.png",
    "../assets/images/vis/economist_daily_chart_54.png",
    "../assets/images/vis/economist_daily_chart_66.png",
    "../assets/images/vis/economist_daily_chart_69.png",
    "../assets/images/vis/economist_daily_chart_75.png",
    "../assets/images/vis/economist_daily_chart_85.png",
    "../assets/images/vis/economist_daily_chart_89.png",
    "../assets/images/vis/economist_daily_chart_99.png",
    "../assets/images/vis/np_21.png",
    "../assets/images/vis/np_48.png",
    "../assets/images/vis/np_7.png",
    "../assets/images/vis/treasuryA10.png",
    "../assets/images/vis/treasuryB04.png",
    "../assets/images/vis/treasuryB10.png",
    "../assets/images/vis/treasuryB15.png",
    "../assets/images/vis/treasuryD04_3.png",
    "../assets/images/vis/treasuryD05_1.png",
    "../assets/images/vis/treasuryD08.png",
    "../assets/images/vis/treasuryG01_2.png",
    "../assets/images/vis/treasuryG02_2.png",
    "../assets/images/vis/treasuryG05_1.png",
    "../assets/images/vis/treasuryG06_2.png",
    "../assets/images/vis/treasuryG07_2.png",
    "../assets/images/vis/treasuryI01_2.png",
    "../assets/images/vis/treasuryI02_1.png",
    "../assets/images/vis/treasuryK01.png",
    "../assets/images/vis/treasuryK03_2.png",
    "../assets/images/vis/treasuryK03_3.png",
    "../assets/images/vis/treasuryK05_1.png",
    "../assets/images/vis/treasuryK06.png",
    "../assets/images/vis/treasuryL03_2.png",
    "../assets/images/vis/treasuryL04_1.png",
    "../assets/images/vis/treasuryL10_1.png",
    "../assets/images/vis/treasuryL11_2.png",
    "../assets/images/vis/treasuryL13.png",
    "../assets/images/vis/treasuryL16.png",
    "../assets/images/vis/v482_n7386_5_f5.png",
    "../assets/images/vis/v482_n7386_7_f2.png",
    "../assets/images/vis/v483_n7387_20_f2.png",
    "../assets/images/vis/v483_n7387_5_f1.png",
    "../assets/images/vis/v483_n7387_7_f4.png",
    "../assets/images/vis/v483_n7388_11_f2.png",
    "../assets/images/vis/v483_n7388_14_f3.png",
    "../assets/images/vis/v483_n7389_24_f3.png",
    "../assets/images/vis/v483_n7390_14_f2.png",
    "../assets/images/vis/v483_n7390_21_f4.png",
    "../assets/images/vis/v483_n7390_8_f1.png",
    "../assets/images/vis/v483_n7391_1_f1.png",
    "../assets/images/vis/v483_n7391_3_f5.png",
    "../assets/images/vis/v483_n7391_8_f1.png",
    "../assets/images/vis/v484_n7392_14_f3.png",
    "../assets/images/vis/v484_n7393_20_f1.png",
    "../assets/images/vis/v484_n7393_6_f4.png",
    "../assets/images/vis/v484_n7394_10_f4.png",
    "../assets/images/vis/v484_n7394_5_f2.png",
    "../assets/images/vis/v484_n7394_5_f5.png",
    "../assets/images/vis/v484_n7394_8_f2.png",
    "../assets/images/vis/v484_n7394_8_f4.png",
    "../assets/images/vis/v484_n7395_11_f1.png",
    "../assets/images/vis/v485_n7397_14_f3.png",
    "../assets/images/vis/v485_n7397_15_f1.png",
    "../assets/images/vis/v485_n7397_6_f4.png",
    "../assets/images/vis/v485_n7399_13_f4.png",
    "../assets/images/vis/v485_n7399_9_f2.png",
    "../assets/images/vis/v485_n7400_14_f1.png",
    "../assets/images/vis/v485_n7400_14_f2.png",
    "../assets/images/vis/v485_n7400_15_f2.png",
    "../assets/images/vis/v486_n7401_8_f1.png",
    "../assets/images/vis/v486_n7401_8_f2.png",
    "../assets/images/vis/v486_n7403_19_f2.png",
    "../assets/images/vis/v486_n7403_1_f8.png",
    "../assets/images/vis/v486_n7404_1_f2.png",
    "../assets/images/vis/v486_n7404_20_f6.png",
    "../assets/images/vis/v486_n7404_6_f1.png",
    "../assets/images/vis/v486_n7404_9_f2.png",
    "../assets/images/vis/v487_n7405_21_f2.png",
    "../assets/images/vis/v487_n7405_22_f1.png",
    "../assets/images/vis/v487_n7405_6_f4.png",
    "../assets/images/vis/v487_n7405_7_f1.png",
    "../assets/images/vis/v487_n7406_13_f2.png",
    "../assets/images/vis/v487_n7406_13_f5.png",
    "../assets/images/vis/v487_n7407_15_f3.png",
    "../assets/images/vis/v487_n7407_22_f2.png",
    "../assets/images/vis/v487_n7407_22_f4.png",
    "../assets/images/vis/v487_n7408_15_f3.png",
    "../assets/images/vis/v488_n7410_13_f4.png",
    "../assets/images/vis/v488_n7410_15_f3.png",
    "../assets/images/vis/v488_n7411_6_f4.png",
    "../assets/images/vis/v488_n7411_9_f1.png",
    "../assets/images/vis/v488_n7412_1_f3.png",
    "../assets/images/vis/v488_n7412_1_f4.png",
    "../assets/images/vis/v488_n7412_4_f1.png",
    "../assets/images/vis/v488_n7412_7_f1.png",
    "../assets/images/vis/v488_n7412_8_f1.png",
    "../assets/images/vis/v488_n7412_9_f1.png",
    "../assets/images/vis/v488_n7413_3_f2.png",
    "../assets/images/vis/v489_n7414_20_f1.png",
    "../assets/images/vis/v489_n7414_25_f2.png",
    "../assets/images/vis/v489_n7415_12_f5.png",
    "../assets/images/vis/v489_n7415_7_f2.png",
    "../assets/images/vis/v489_n7416_15_f2.png",
    "../assets/images/vis/v489_n7416_19_f3.png",
    "../assets/images/vis/v489_n7416_3_f4.png",
    "../assets/images/vis/v489_n7416_4_f6.png",
    "../assets/images/vis/v490_n7418_12_f1.png",
    "../assets/images/vis/v490_n7418_14_f2.png",
    "../assets/images/vis/v490_n7418_1_f2.png",
    "../assets/images/vis/v490_n7418_6_f3.png",
    "../assets/images/vis/v490_n7419_11_f1.png",
    "../assets/images/vis/v490_n7419_20_f3.png",
    "../assets/images/vis/v490_n7419_2_f1.png",
    "../assets/images/vis/v490_n7419_2_f2.png",
    "../assets/images/vis/v490_n7419_7_f4.png",
    "../assets/images/vis/v490_n7420_13_f4.png",
    "../assets/images/vis/v490_n7420_23_f5.png",
    "../assets/images/vis/vis109.png",
    "../assets/images/vis/vis230.png",
    "../assets/images/vis/vis250.png",
    "../assets/images/vis/vis278.png",
    "../assets/images/vis/vis286.png",
    "../assets/images/vis/vis288.png",
    "../assets/images/vis/vis328.png",
    "../assets/images/vis/vis386.png",
    "../assets/images/vis/vis399.png",
    "../assets/images/vis/vis409.png",
    "../assets/images/vis/vis416.png",
    "../assets/images/vis/vis417.png",
    "../assets/images/vis/vis428.png",
    "../assets/images/vis/vis499.png",
    "../assets/images/vis/vis512.png",
    "../assets/images/vis/vis564.png",
    "../assets/images/vis/vis586.png",
    "../assets/images/vis/vis618.png",
    "../assets/images/vis/vis625.png",
    "../assets/images/vis/vis630.png",
    "../assets/images/vis/vis652.png",
    "../assets/images/vis/vis67.png",
    "../assets/images/vis/vis673.png",
    "../assets/images/vis/vis678.png",
    "../assets/images/vis/vis684.png",
    "../assets/images/vis/vis697.png",
    "../assets/images/vis/vis708.png",
    "../assets/images/vis/vis729.png",
    "../assets/images/vis/vis734.png",
    "../assets/images/vis/vis768.png",
    "../assets/images/vis/vis826.png",
    "../assets/images/vis/vis831.png",
    "../assets/images/vis/vis850.png",
    "../assets/images/vis/vis853.png",
    "../assets/images/vis/vis859.png",
    "../assets/images/vis/vis87.png",
    "../assets/images/vis/vis881.png",
    "../assets/images/vis/visMost108.png",
    "../assets/images/vis/visMost132.png",
    "../assets/images/vis/visMost143.png",
    "../assets/images/vis/visMost147.png",
    "../assets/images/vis/visMost187.png",
    "../assets/images/vis/visMost190.png",
    "../assets/images/vis/visMost215.png",
    "../assets/images/vis/visMost217.png",
    "../assets/images/vis/visMost227.png",
    "../assets/images/vis/visMost232.png",
    "../assets/images/vis/visMost240.png",
    "../assets/images/vis/visMost244.png",
    "../assets/images/vis/visMost248.png",
    "../assets/images/vis/visMost255.png",
    "../assets/images/vis/visMost261.png",
    "../assets/images/vis/visMost267.png",
    "../assets/images/vis/visMost271.png",
    "../assets/images/vis/visMost274.png",
    "../assets/images/vis/visMost282.png",
    "../assets/images/vis/visMost357.png",
    "../assets/images/vis/visMost362.png",
    "../assets/images/vis/visMost374.png",
    "../assets/images/vis/visMost376.png",
    "../assets/images/vis/visMost378.png",
    "../assets/images/vis/visMost387.png",
    "../assets/images/vis/visMost420.png",
    "../assets/images/vis/visMost451.png",
    "../assets/images/vis/visMost456.png",
    "../assets/images/vis/visMost468.png",
    "../assets/images/vis/visMost496.png",
    "../assets/images/vis/visMost505.png",
    "../assets/images/vis/visMost52.png",
    "../assets/images/vis/visMost523.png",
    "../assets/images/vis/visMost526.png",
    "../assets/images/vis/visMost537.png",
    "../assets/images/vis/visMost54.png",
    "../assets/images/vis/visMost545.png",
    "../assets/images/vis/visMost55.png",
    "../assets/images/vis/visMost575.png",
    "../assets/images/vis/visMost601.png",
    "../assets/images/vis/visMost623.png",
    "../assets/images/vis/visMost635.png",
    "../assets/images/vis/visMost645.png",
    "../assets/images/vis/visMost657.png",
    "../assets/images/vis/visMost673.png",
    "../assets/images/vis/visMost705.png",
    "../assets/images/vis/visMost735.png",
    "../assets/images/vis/visMost745.png",
    "../assets/images/vis/visMost755.png",
    "../assets/images/vis/visMost758.png",
    "../assets/images/vis/visMost77.png",
    "../assets/images/vis/visMost82.png",
    "../assets/images/vis/visMost83.png",
    "../assets/images/vis/visMost92.png",
    "../assets/images/vis/visMost93.png",
    "../assets/images/vis/whoB03_1.png",
    "../assets/images/vis/whoB05_1.png",
    "../assets/images/vis/whoB13_2.png",
    "../assets/images/vis/whoB15_1.png",
    "../assets/images/vis/whoB19_1.png",
    "../assets/images/vis/whoB20_1.png",
    "../assets/images/vis/whoB22_1.png",
    "../assets/images/vis/whoB24_1.png",
    "../assets/images/vis/whoB25_2.png",
    "../assets/images/vis/whoB32_1.png",
    "../assets/images/vis/whoI11_1.png",
    "../assets/images/vis/whoI11_2.png",
    "../assets/images/vis/whoI12_2.png",
    "../assets/images/vis/whoI14.png",
    "../assets/images/vis/whoI19.png",
    "../assets/images/vis/whoI22.png",
    "../assets/images/vis/whoJ15_1.png",
    "../assets/images/vis/whoJ15_2.png",
    "../assets/images/vis/whoJ23.png",
    "../assets/images/vis/whoJ32.png",
    "../assets/images/vis/whoJ33.png",
    "../assets/images/vis/whoJ36_1.png",
    "../assets/images/vis/whoJ36_2.png",
    "../assets/images/vis/whoJ40_1.png",
    "../assets/images/vis/whoJ40_2.png",
    "../assets/images/vis/whoJ43_2.png",
    "../assets/images/vis/whoJ44.png",
    "../assets/images/vis/whoJ48_2.png",
    "../assets/images/vis/whoK04_2.png",
    "../assets/images/vis/whoK06_2.png",
    "../assets/images/vis/whoK07_2.png",
    "../assets/images/vis/whoK08.png",
    "../assets/images/vis/whoK12_2.png",
    "../assets/images/vis/whoK17_1.png",
    "../assets/images/vis/whoK19_1.png",
    "../assets/images/vis/whoK23_2.png",
    "../assets/images/vis/whoK31.png",
    "../assets/images/vis/whoL03.png",
    "../assets/images/vis/whoL06.png",
    "../assets/images/vis/whoL09.png",
    "../assets/images/vis/whoL10.png",
    "../assets/images/vis/whoL11.png",
    "../assets/images/vis/whoL12.png",
    "../assets/images/vis/whoL14.png",
    "../assets/images/vis/whoM05.png",
    "../assets/images/vis/whoN05.png",
    "../assets/images/vis/whoN08.png",
    "../assets/images/vis/whoN10.png",
    "../assets/images/vis/whoN16_1.png",
    "../assets/images/vis/whoN18.png",
    "../assets/images/vis/whoN21_1.png",
    "../assets/images/vis/whoN22.png",
    "../assets/images/vis/whoN23_2.png",
    "../assets/images/vis/whoN32_2.png",
    "../assets/images/vis/whoN33.png",
    "../assets/images/vis/whoO06_2.png",
    "../assets/images/vis/whoO12.png",
    "../assets/images/vis/whoP13.png",
    "../assets/images/vis/whoP16.png",
    "../assets/images/vis/whoQ06_2.png",
    "../assets/images/vis/whoQ09_2.png",
    "../assets/images/vis/whoQ11_1.png",
    "../assets/images/vis/whoQ14_2.png",
    "../assets/images/vis/whoQ15_1.png",
    "../assets/images/vis/whoQ18_3.png",
    "../assets/images/vis/whoQ26.png",
    "../assets/images/vis/whoQ32_2.png",
    "../assets/images/vis/whoQ41_1.png",
    "../assets/images/vis/whoQ42_1.png",
    "../assets/images/vis/whoQ44_4.png",
    "../assets/images/vis/whoQ48_4.png",
    "../assets/images/vis/whoQ48_5.png",
    "../assets/images/vis/whoQ50_2.png",
    "../assets/images/vis/whoQ51_2.png",
    "../assets/images/vis/whoQ52_4.png",
    "../assets/images/vis/wsj10.png",
    "../assets/images/vis/wsj104.png",
    "../assets/images/vis/wsj108.png",
    "../assets/images/vis/wsj11.png",
    "../assets/images/vis/wsj116.png",
    "../assets/images/vis/wsj129.png",
    "../assets/images/vis/wsj135.png",
    "../assets/images/vis/wsj144.png",
    "../assets/images/vis/wsj147.png",
    "../assets/images/vis/wsj162.png",
    "../assets/images/vis/wsj167.png",
    "../assets/images/vis/wsj170.png",
    "../assets/images/vis/wsj172.png",
    "../assets/images/vis/wsj176.png",
    "../assets/images/vis/wsj184.png",
    "../assets/images/vis/wsj20.png",
    "../assets/images/vis/wsj21.png",
    "../assets/images/vis/wsj214.png",
    "../assets/images/vis/wsj220.png",
    "../assets/images/vis/wsj226.png",
    "../assets/images/vis/wsj233.png",
    "../assets/images/vis/wsj240.png",
    "../assets/images/vis/wsj259.png",
    "../assets/images/vis/wsj262.png",
    "../assets/images/vis/wsj264.png",
    "../assets/images/vis/wsj270.png",
    "../assets/images/vis/wsj271.png",
    "../assets/images/vis/wsj277.png",
    "../assets/images/vis/wsj28.png",
    "../assets/images/vis/wsj286.png",
    "../assets/images/vis/wsj292.png",
    "../assets/images/vis/wsj294.png",
    "../assets/images/vis/wsj297.png",
    "../assets/images/vis/wsj299.png",
    "../assets/images/vis/wsj308.png",
    "../assets/images/vis/wsj316.png",
    "../assets/images/vis/wsj340.png",
    "../assets/images/vis/wsj359.png",
    "../assets/images/vis/wsj360.png",
    "../assets/images/vis/wsj392.png",
    "../assets/images/vis/wsj395.png",
    "../assets/images/vis/wsj405.png",
    "../assets/images/vis/wsj441.png",
    "../assets/images/vis/wsj459.png",
    "../assets/images/vis/wsj462.png",
    "../assets/images/vis/wsj474.png",
    "../assets/images/vis/wsj481.png",
    "../assets/images/vis/wsj505.png",
    "../assets/images/vis/wsj508.png",
    "../assets/images/vis/wsj511.png",
    "../assets/images/vis/wsj52.png",
    "../assets/images/vis/wsj521.png",
    "../assets/images/vis/wsj529.png",
    "../assets/images/vis/wsj533.png",
    "../assets/images/vis/wsj536.png",
    "../assets/images/vis/wsj54.png",
    "../assets/images/vis/wsj540.png",
    "../assets/images/vis/wsj55.png",
    "../assets/images/vis/wsj553.png",
    "../assets/images/vis/wsj557.png",
    "../assets/images/vis/wsj561.png",
    "../assets/images/vis/wsj593.png",
    "../assets/images/vis/wsj612.png",
    "../assets/images/vis/wsj79.png",
    "../assets/images/vis/wsj9.png",
    "../assets/images/vis/wsj99.png"
  ],
  spacing: 10,
  num_trials: 10,
  fixation_rest_time: 1500, // amount of time fixation cross will appear on screen with each trial, in ms
  image_show_time: 10000 // amount of time the image will appear on screen with each trial, in ms
};
