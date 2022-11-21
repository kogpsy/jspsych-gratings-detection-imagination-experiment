/*
 * imadet-replication-experiment-3
 *
 * Author: Robin Bürkli <robuba.jr@gmx.ch>
 * License: MIT
 *
 * This file contains the detection practice trials of the experiment.
 */

import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import GaborStimulusPlugin, {
  GaborStimulusPluginConfig,
} from '@kogpsy/jspsych-gabor-stimulus-plugin';
import { JsPsych } from 'jspsych';

import {
  GRATING_VISIBILITY_LEVEL_PRACTICE,
  PRACTICE_DETECTION_REPETITIONS,
  STIMULUS_SIZE,
} from './constants';

import {
  calculatePracticeStats,
  getGaborPluginConfig,
  ResponseMapping,
} from './utils';

/**
 * Builds the timeline for the detection practice part of the experiment.
 *
 * @param jsPsychInstance The jsPsych instance to be used
 * @param responseMapping An object containing the response mapping for
 * the current experimental session
 * @param fixationCrossTrial A jsPsych trial which briefly shows a fixation
 * cross
 * @returns A jsPsych nested timeline
 */
export const getPracticeDetectionTimeline = (
  jsPsychInstance: JsPsych,
  responseMapping: ResponseMapping,
  backgroundNoiseFrames: string[],
  fixationCrossTrial: any
): { timeline: any[] } => {
  // Declare the sub-timeline array
  let timeline: any[] = [];

  // Obtain a copy of initial grating visibility
  let gratingVisibility = GRATING_VISIBILITY_LEVEL_PRACTICE;

  // Define the instruction trial
  const practiceInstruction = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <p> Wir starten mit einigen Übungsdurchgängen. </p>
      <p>
        Es erscheinen nach links und rechts geneigte Gittermuster im Rauschen.
        Wenn Sie im Rauschen ein Gittermuster sehen, drücken Sie die
        <strong>Taste [ ${responseMapping.responses[0]} ]</strong>. Wenn Sie
        im Rauschen kein Gittermuster sehen, drücken Sie die
        <strong>Taste [ ${responseMapping.responses[1]} ]</strong>.
      </p>
      <div class="vertical_spacer"></div>
      <p> Drücken Sie die [Leertaste] um die Übungsdurchgänge zu beginnen. </p>`,
    choices: [' '],
  };
  timeline.push(practiceInstruction);

  // Define the stimulus trial. Stimuli are taken from the "timeline
  // variables" of jsPsych.
  const stimulusTrial = {
    type: GaborStimulusPlugin,
    config: () => {
      return getGaborPluginConfig(
        jsPsychInstance.timelineVariable('stimulusConfig')
      );
    },
    // Set choices
    choices: responseMapping.responses,
    // Additionally store to this this trial the correct response and a note
    // about it being a practice trial.
    data: jsPsychInstance.timelineVariable('data'),
    on_finish: (data: any) => {
      // When the trial is finished, add an addtitional key to the data object
      // which tells whether the response was correct.
      data.correct = jsPsychInstance.pluginAPI.compareKeys(
        data.correct_response,
        data.response
      );
    },
    post_trial_gap: () => {
      // Pick an inter trial interval between 600s and 1200ms
      const iti = Math.floor(Math.random() * 1200 + 600);
      return iti;
    },
  };

  // Combine the above two into a trial procedure, so that multiple animations
  // and response screens are shown with random stimuli.
  const practiceProcedure = {
    timeline: [fixationCrossTrial, stimulusTrial],
    // Here the stimuli are added to the timeline variables. An array of images
    // is constructed for left and right tilted gratings as well as for a noise
    // animation.
    // For each stimulus, another timeline variable called data is created which
    // contains the correct response and note about it being a practice trial.
    timeline_variables: [
      {
        stimulusConfig: {
          stimulusSize: STIMULUS_SIZE,
          backgroundNoiseFrames: backgroundNoiseFrames,
          opacity: gratingVisibility,
          rotation: 45,
        },
        choices: responseMapping.responses,
        data: {
          test_part: 'practice_detection',
          correct_response: responseMapping.responses[0],
        },
      },
      {
        stimulusConfig: {
          stimulusSize: STIMULUS_SIZE,
          backgroundNoiseFrames: backgroundNoiseFrames,
          opacity: gratingVisibility,
          rotation: 135,
        },
        choices: responseMapping.responses,
        data: {
          test_part: 'practice_detection',
          correct_response: responseMapping.responses[0],
        },
      },
      {
        stimulusConfig: {
          stimulusSize: STIMULUS_SIZE,
          backgroundNoiseFrames: backgroundNoiseFrames,
          opacity: 0,
          rotation: 45,
        },
        choices: responseMapping.responses,
        data: {
          test_part: 'practice_detection',
          correct_response: responseMapping.responses[1],
        },
      },
    ],
    // Repeat the practice procedure according to the ./constants.js file
    sample: {
      type: 'fixed-repetitions',
      size: PRACTICE_DETECTION_REPETITIONS,
    },
  };

  // Give the participant feedback about his/her performance
  const practiceFeedbackScreen = {
    type: HtmlKeyboardResponsePlugin,
    choices: [' '],
    stimulus: function () {
      // Calcualte accuracy
      const stats = calculatePracticeStats(
        jsPsychInstance,
        PRACTICE_DETECTION_REPETITIONS
      );
      // And give feedback accordingly
      if (stats.accuracy > 74) {
        return `
          <p>
           Ausgezeichnet, Sie haben ${stats.correctResponses} von
           ${stats.trialCount} Durchgängen richtig beantwortet.
          </p>
          <p>Drücken Sie die [Leertaste], um fortzufahren.</p>
          `;
      } else {
        return `
          <p>
            Sie haben ${stats.correctResponses} von ${stats.trialCount}
            Durchgängen richtig beantwortet. Es werden nun weitere
            Übungsdurchgänge folgen.
          </p>
          <p>Drücken Sie die [Leertaste], um fortzufahren.</p>
          `;
      }
    },
  };

  // Loop the practice procedure and the feedback screen until an accuracy of
  // at least 75% is reached. For each failed run, decrease difficulty.
  const practiceMainLoop = {
    timeline: [practiceProcedure, practiceFeedbackScreen],
    loop_function: function (data) {
      // Calculate accuracy
      const stats = calculatePracticeStats(
        jsPsychInstance,
        PRACTICE_DETECTION_REPETITIONS
      );
      // Stop the loop if a high enough accuracy is reached.
      if (stats.accuracy > 74) {
        return false;
      } else {
        // If it isn't reached, decrease difficulty by making the grating more
        // visible.
        gratingVisibility += 0.02; // Dijkstra increases by 1 unit on a scale from 0 to 50
        return true;
      }
    },
  };

  // Push this main loop to the timeline
  timeline.push(practiceMainLoop);

  // Return a jsPsych nested timeline object
  return {
    timeline,
  };
};
