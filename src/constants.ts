/*
 * Constant variables that control some aspects of the experiment.
 * Defaults are adapted from the source code of the initial study by Dijkstra et
 * al. (2021).
 *
 * Author: Robin Bürkli <robuba.jr@gmx.ch>
 * License: MIT
 */

/**
 *
 * General settings
 *
 */

// Define whether to build for development or production (influences block size,
// number of generated noise frames, ...)
// Default: false
const DEV_MODE = false;

// Define the stimulus size in pixels
// Default: 250
export const STIMULUS_SIZE = 250;

// Define FPS of the background animation
// Default: 10
export const BACKGROUND_ANIMATION_FPS = 10;

// Define number of noise frames to generate (bigger numbers will cause longer
// loading times before the experiment can start, but offer a more 'random'
// noise)
// Default: 30
export const BACKGROUND_ANIMATION_FRAME_NUMBER = DEV_MODE ? 5 : 30;

// Define how long the fixation cross should be displayed (in milliseconds)
// Default: 200
export const FIXATION_CROSS_DURATION = 200;

// Define the start level of the visibility of the gratings (from 0 to 1)
// Dijkstra uses 46 on her scale which is equivalent to 0.92 on our scale, but
// it seems that this is very easy. So we've lowered the default to 0.8.
// Default: 0.92
export const GRATING_VISIBILITY_LEVEL_PRACTICE = 0.8;

// Define the different levels of grating visibility for the main part of the
// experiment. Note that there should be 7 different levels, in order for the
// block size to remain the same as in the original experiment. TypeScript
// enforces this (at least at editor level).
// Default: [ 0, 0.037, 0.048, 0.053, 0.061, 0.073, 0.14 ]
export const GRATING_VISIBILITY_LEVELS_MAIN: [
  { visibility: number },
  { visibility: number },
  { visibility: number },
  { visibility: number },
  { visibility: number },
  { visibility: number },
  { visibility: number }
] = [
  { visibility: 0 },
  { visibility: 0.037 },
  { visibility: 0.048 },
  { visibility: 0.053 },
  { visibility: 0.061 },
  { visibility: 0.073 },
  { visibility: 0.14 },
];

/**
 *
 * Settings regarding the detection practice task
 *
 */

// Define how many times the practice trial procedure should be carried out. A
// single procedure contains 3 grating animations.
// Default: 2
export const PRACTICE_DETECTION_REPETITIONS = 2;

/**
 *
 * Settings regarding the imagination practice task
 *
 */

// Controls how many noise animations are shown per grating tilt.
// Default: 10
export const PRACTICE_IMAGINATION_TRIALS_PER_TILT = DEV_MODE ? 2 : 10;

/**
 *
 * Settings regarding the main part of the experiment
 *
 */

// Controls how many times all the conditions are repeated. There are six
// conditions (left tilted gratings without imagination, left tilted gratings
// with imagination of left tilted gratings, left tilted gratings with
// imagination of right tilted gratings, and the same for right tilted
// gratings).
// Default: 2
export const MAIN_EXPERIMENT_CONDITION_REPETITIONS = DEV_MODE ? 1 : 2;

// Controls how many animations are shown in each of the above mentioned
// conditions. This must be dividible by the number of different visibility
// levels specified under GRATING_VISIBILITY_LEVELS_MAIN (usually 7).
// Default: 42
export const MAIN_EXPERIMENT_TRIALS_PER_CONDITION = DEV_MODE ? 14 : 42;
