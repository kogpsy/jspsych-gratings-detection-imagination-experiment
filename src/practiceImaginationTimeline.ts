/*
 * imadet-replication-experiment-3
 *
 * Author: Robin Bürkli <robuba.jr@gmx.ch>
 * License: MIT
 *
 * This file contains the imagination practice timelinen of the experiment.
 *
 * Participants are asked to imagine a grating with a certain tilt while seeing
 * random noise animations.
 */

// Import plugins
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import GaborStimulusPlugin, {
  GaborStimulusPluginConfig,
} from '@kogpsy/jspsych-gabor-stimulus-plugin';
import { JsPsych } from 'jspsych';

// Import constants and utils
import {
  BACKGROUND_ANIMATION_FPS,
  PRACTICE_IMAGINATION_TRIALS_PER_TILT,
  STIMULUS_SIZE,
} from './constants';

/**
 * Builds the timeline for the detection staircase part of the experiment.
 *
 * @param jsPsychInstance The jsPsych instance to be used
 * @param fixationCrossTrial A jsPsych trial which briefly shows a fixation
 * cross
 * @returns A jsPsych nested timeline
 */
export const getPracticeImaginationTimeline = (
  jsPsychInstance: JsPsych,
  fixationCrossTrial: any,
  backgroundNoiseFrames: string[]
) => {
  // Declare and initiate a timeline array
  let timeline: any[] = [];

  // Define the main instruction of this experiment part
  const mainInstruction = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <p>
        Ein weiterer Teil des Experiments ist, dass wir Sie manchmal auffordern
        sich ein Gitter vorzustellen, während Sie die Rauschmuster betrachten.
        Sie werden immer gebeten, sich das gleiche Gitter für einige Versuche
        hintereinander vorzustellen.
      </p>
      <p> Das können Sie jetzt üben. </p>
      <div class="vertical_spacer"></div>
      <p>Drücken Sie die [ Leertaste ] um fortzufahren.</p>
    `,
    choices: [' '],
  };
  timeline.push(mainInstruction);

  // Define the instruction shown before each of the two blocks (left/right).
  // Here the instruction text is generated dynamically according to the current
  // tilt.
  const blockInstruction = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: () => {
      const gratingTilt = jsPsychInstance.timelineVariable('gratingTilt');
      let instructionGratingTilt = '';
      let instructionExampleImage = '';
      if (gratingTilt === 'right') {
        instructionGratingTilt = 'rechts';
        instructionExampleImage = 'media/images/example-grating-right-tilt.jpg';
      } else if (gratingTilt === 'left') {
        instructionGratingTilt = 'links';
        instructionExampleImage = 'media/images/example-grating-left-tilt.jpg';
      }
      return `
        <p>
          Für die nächsten Durchgänge stellen Sie sich bitte ein <strong> nach
          ${instructionGratingTilt} geneigtes Gittermuster </strong> vor (siehe
          unten). Stellen Sie sich das Gittermuster so lebhaft wie möglich vor,
          so als ob es tatsächlich auf Ihrem Bildschirm dargestellt würde. Bitte
          halten Sie Ihre Augen offen und schauen Sie auf das Rauschen, während
          Sie sich das Gitter vorstellen.
        </p>
        <p>
          Nach jedem Durchgang werden Sie gebeten, die Lebendigkeit Ihrer
          Vorstellung auf einer Skala von 1 (überhaupt nicht lebendig) bis 5 (so
          lebhaft, als wäre sie real) zu bewerten.
        </p>
        <div class="vertical_spacer"></div>
        <img src="${instructionExampleImage}" width="200" />
        <div class="vertical_spacer"></div>
        <p> Drücken Sie die [ Leertaste ] um fortzufahren. </p>`;
    },
    choices: [' '],
  };

  const gaborConfig: GaborStimulusPluginConfig = {
    stimulus: {
      size: STIMULUS_SIZE,
      opacity: 0,
    },
    background: {
      type: 'animation',
      frames: backgroundNoiseFrames,
      fps: BACKGROUND_ANIMATION_FPS,
    },
    fixationCross: {},
    choices: [],
    timing: {
      trialDuration: 2000,
    },
  };

  // Define a noise only animation
  const noiseAnimation = {
    type: GaborStimulusPlugin,
    config: gaborConfig,
  };

  // Define the response screen where participants can rate their imagination
  const responsePrompt = {
    type: HtmlKeyboardResponsePlugin,
    choices: ['0', '1', '2', '3', '4', '5'],
    stimulus: '<p> Wie lebhaft war Ihre Vorstellung? </p>',
    prompt: 'Überhaupt nicht lebendig [1] - So lebhaft, als wäre sie real [5]',
    data: { test_part: 'practice_imagination' },
  };

  // Repeat the imagination trials according to './constants.js'
  const practiceTrialsLoop = {
    timeline: [fixationCrossTrial, noiseAnimation, responsePrompt],
    repetitions: PRACTICE_IMAGINATION_TRIALS_PER_TILT,
  };

  // Create two blocks of the above trials. In one of which the participants are
  // asked to imagine left tilted gratings, in the other they are asked to
  // imagine right tilted gratings.
  const blockProcedure = {
    timeline: [blockInstruction, practiceTrialsLoop],
    // Define the two tilts as timeline variables which chan then be accessed
    // by each block.
    timeline_variables: [
      {
        gratingTilt: 'left',
      },
      {
        gratingTilt: 'right',
      },
    ],
    // Randomize which tilt comes first
    randomize_order: true,
  };
  timeline.push(blockProcedure);

  // Return a jsPsych nested timeline object
  return {
    timeline,
  };
};
