/**
 * Utilities used throughout the project.
 *
 * Author: Robin Bürkli <robuba.jr@gmx.ch>
 * License: MIT
 */

// Import gabor plugin config type
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import {
  GaborStimulusPluginConfig,
  generateFixationCross,
} from '@kogpsy/jspsych-gabor-stimulus-plugin';
import { JsPsych } from 'jspsych';
import {
  BACKGROUND_ANIMATION_FPS,
  FIXATION_CROSS_DURATION,
  STIMULUS_SIZE,
} from './constants';

type Parameters = {
  stimulusSize: number;
  backgroundNoiseFrames: string[];
  opacity: number;
  rotation: number;
};

/**
 * Abstracts fairly complex gabor stimulus plugin config to solely 5 params
 *
 * @param param0 Simplified configuration object (see type declaration)
 * @returns Gabor stimulus plugin config
 */
export const getGaborPluginConfig = ({
  stimulusSize,
  backgroundNoiseFrames,
  opacity,
  rotation,
}: Parameters): GaborStimulusPluginConfig => {
  return {
    stimulus: {
      size: stimulusSize,
      density: 6,
      opacity: opacity,
      rotation: rotation,
      blend_mode: 'overlay',
    },
    aperture: {
      radius: stimulusSize / 3,
      blur: stimulusSize / 12,
    },
    background: {
      type: 'animation',
      frames: backgroundNoiseFrames,
      fps: BACKGROUND_ANIMATION_FPS,
    },
    fixation_cross: {
      size: 20,
      weight: 4,
      color: 'white',
    },
  };
};

export type ResponseMapping = {
  responses: string[];
  responsePrompt: string;
};

/**
 * Generates a random response mapping.
 *
 * @returns An object with the keys 'responses' and 'responsePrompt' which can
 * be used in jsPsych trials.
 */
export const getRandomResponseMapping = (): ResponseMapping => {
  // Declare variables
  let responses: string[], responsePrompt: string;
  // Create a random boolean variable
  const randomBool = Math.random() < 0.5;
  // And map the response keys accordingly
  if (randomBool) {
    responses = ['F', 'J'];
    responsePrompt =
      'Ja [ ' + responses[0] + ' ] oder nein [ ' + responses[1] + ' ]';
  } else {
    responses = ['J', 'F'];
    responsePrompt =
      'Nein [ ' + responses[1] + ' ] oder ja [ ' + responses[0] + ' ]';
  }
  // Finally return the mapping wrapped into an object
  return {
    responses,
    responsePrompt,
  };
};

/**
 * Returns the fixation cross trial object
 *
 * @returns A jsPsych trial object
 */
export const getFixationCross = () => {
  // Generate a fixation cross using the generator of gabor plugin (temporary,
  // but functional)
  const svg = generateFixationCross(STIMULUS_SIZE, 20, 4, 'white');
  // Set and unset some style to make it work with this experiment
  svg.style.position = 'relative';
  svg.style.top = '';
  svg.style.left = '';
  svg.style.fontSize = '0';
  // Return an html keyboard response plugin instance
  return {
    type: HtmlKeyboardResponsePlugin,
    stimulus: svg.outerHTML,
    // Set the style of that particular plugin instance
    on_load: () => {
      (
        document.getElementById(
          'jspsych-html-keyboard-response-stimulus'
        ) as HTMLElement
      ).style.fontSize = '0';
      (
        document.getElementById(
          'jspsych-html-keyboard-response-stimulus'
        ) as HTMLElement
      ).style.lineHeight = '0';
    },
    choices: 'NO_KEYS',
    trial_duration: FIXATION_CROSS_DURATION,
    //data: { test_part: 'fixation_cross' },
  };
};

/**
 * Takes a jsPsych instance and the number of practice procedure repetitions to
 * calculate how accuratly the participant did respond.
 *
 * @param {Object} jsPsychInstance A jsPsych instance where the data is gathered
 * from
 * @param {number} practiceRepetitions Number of times the practice procedure
 * is repeated
 * @returns {Object} An object containing accuracy, number of correct responses
 * and the trial count
 */
export const calculatePracticeStats = (
  jsPsychInstance: JsPsych,
  practiceRepetitions: number
): { correctResponses: number; accuracy: number; trialCount: number } => {
  // Get the most recent trials from the data object.
  // We take practiceRepetitions * 3 * 2 becauses during each practice procedure
  // 3 grating tasks are presented, and each of those consists of a fixation
  // cross and the stimulus itself. We need all these trials to filter out the
  // ones containing the data we want.
  const trials = jsPsychInstance.data
    .get()
    .last(practiceRepetitions * 3 * 2)
    .filter({ test_part: 'practice_detection' });
  const correctResponses = trials.filter({ correct: true }).count();
  const accuracy = Math.round((correctResponses / trials.count()) * 100);

  // Return an object containing all the interesting data
  return {
    correctResponses,
    accuracy,
    trialCount: trials.count(),
  };
};

/**
 * Different kinds of grating tilt
 */
export enum GratingTilt {
  Left,
  Right,
}
