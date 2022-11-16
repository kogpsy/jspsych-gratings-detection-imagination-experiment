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

// Define the stimulus size in pixels
// Default: 250
export const STIMULUS_SIZE = 250;

// Define FPS of the background animation
// Default: 10
export const BACKGROUND_ANIMATION_FPS = 10;

// Define how long the fixation cross should be displayed (in milliseconds)
// Default: 200
export const FIXATION_CROSS_DURATION = 200;

// Define the start level of the visibility of the gratings (from 0 to 1)
// Dijkstra uses 46 on her scale which is equivalent to 0.92 on our scale, but
// it seems that this is very easy. So we've lowered the default to 0.8.
// Default: 0.92
export const GRATING_VISIBILITY_LEVEL_INIT = 0.8;

// Define the maximum level of the grating visibility
// Default: 1
export const GRATING_VISIBILITY_LEVEL_MAX = 1;

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
 * Settings regarding the staircase detection calibration task
 *
 */

// The desired accuracy to staircase to. For each participant we want to figure
// out the grating visibility level at which they detect 70% correctly.
// Default: 70
export const STAIRCASE_ACCURACY_TARGET = 70;

// If after a cycle the accuracy is higher than this value,  we increase the
// difficulty.
// Default: 75
export const STAIRCASE_ACCURACY_UPPER_BOUND = 75;

// If after a cycle the accuracy is lower than this value,  we decrease the
// difficulty.
// Default: 65
export const STAIRCASE_ACCURACY_LOWER_BOUND = 65;

// Controls how many grating animations are shown per accuracy estimation cycle.
// This must be an even number, so that in exactly 50% of the trials a grating
// vs. a noise animation can be shown.
// Default: 10
export const STAIRCASE_TRIALS_PER_CYCLE = 10;

// Controls how many accuracy estimation cycles are carried out.
// Default: 12
export const STAIRCASE_CYCLES = 12;

/**
 *
 * Settings regarding the imagination practice task
 *
 */

// Controls how many noise animations are shown per grating tilt.
// Default: 10
export const PRACTICE_IMAGINATION_TRIALS_PER_TILT = 10;

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
export const MAIN_EXPERIMENT_CONDITION_REPETITIONS = 2;

// Controls how many animations are shown in each of the above mentioned
// conditions. This must be an even number, so that in exactly 50% of the trials
// a grating vs. a noise animation can be shown.
// Default: 24 (Dijkstra used this value, here it is increased)
export const MAIN_EXPERIMENT_TRIALS_PER_CONDITION = 50;
