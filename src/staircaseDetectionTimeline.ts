/*
 * imadet-replication-experiment-3
 *
 * Author: Robin Bürkli <robuba.jr@gmx.ch>
 * License: MIT
 *
 * This file contains the staircase timeline of the experiment.
 *
 * The staircase detection part consists of two blocks randomized in order. One
 * time left tilted gratings are presented, the other time right tilted gratings
 * are presented.
 *
 * The goal is to find the individual detection accuracy of a participant. To
 * do so, in each block, there are several sub-blocks (called cycles), within
 * which some gratings are presented with a certain visibility. After each
 * cycle, the accuracy is estimated, and, if above a certain threshold, the
 * difficulty is increased (i.e. the visibility of the gratings gets decreased).
 */

// Import plugins
import CallFunctionPlugin from '@jspsych/plugin-call-function';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import GaborStimulusPlugin from '@kogpsy/jspsych-gabor-stimulus-plugin';

// Import constants
import {
  GRATING_VISIBILITY_LEVEL_INIT,
  STAIRCASE_CYCLES,
  STAIRCASE_TRIALS_PER_CYCLE,
  STIMULUS_SIZE,
} from './constants';
import { ParticipantVisibilityThreshold } from './ParticipantVisibilityThreshold';

// Import utils
import {
  calculateStaircaseStats,
  getGaborPluginConfig,
  GratingTilt,
  ResponseMapping,
} from './utils';

/**
 * Builds the timeline for the detection staircase part of the experiment.
 *
 * @param jsPsychInstance The jsPsych instance to be used
 * @param responseMapping An object containing the response mapping for
 * the current experimental session
 * @param fixationCrossTrial A jsPsych trial which briefly shows a fixation
 * cross
 * @param participantVisibilityThreshold A "shared" object which holds
 * the grating visibility levels of the current participant. Contains a setter
 * which is used here.
 * @returns A jsPsych nested timeline
 */
export const getStaircaseDetectionTimeline = (
  jsPsychInstance: any,
  responseMapping: ResponseMapping,
  backgroundNoiseFrames: string[],
  fixationCrossTrial: any,
  participantVisibilityThreshold: ParticipantVisibilityThreshold
) => {
  // Declare and initiate a timeline array
  let timeline: any[] = [];
  // Define some "global" state variables
  let currentGratingVisibility = GRATING_VISIBILITY_LEVEL_INIT;
  let cyclesCarriedOut = 0;

  // Define the main instruction for the staircase timeline
  const staircaseMainInstruction = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <p> Nun werden zwei Kalibrierungsblöcke durchgeführt. </p>
      <p>
        Bei 75% der Durchgänge wird ein Gitter im Rauschen erscheinen. Mit der
        Zeit wird es immer schwerer das Gitter zu sehen. Machen Sie sich keine
        Sorgen, wenn Sie unsicher sind, ob Sie etwas gesehen haben oder nicht.
        Versuchen Sie einfach ihr Bestes bei jedem Versuch.
      </p>
      <p> Jeder Klaibrierungsblock dauert etwa 5 Minuten. </p>
      <div class="vertical_spacer"></div>
      <p> Drücken Sie die [ Leertaste ] um fortzufahren. </p>`,
    choices: [' '],
  };
  timeline.push(staircaseMainInstruction);

  // Define the instruction for each of the two blocks
  const staircaseBlockInstruction = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: () => {
      // Construct instruction string based on timeline variable
      const gratingTiltString =
        jsPsychInstance.timelineVariable('stimulusTilt') === GratingTilt.Left
          ? 'links'
          : 'rechts';
      return `
        <p>
          Während dieses Blocks werden Sie nach ${gratingTiltString} geneigte
          Gittermuster sehen.
        </p>
        <p>
          Zur Erinnerung:
        </p>
        <p>
          Wenn Sie im Rauschen ein Gittermuster sehen, drücken Sie
          die <strong>Taste [ ${responseMapping.responses[0]} ]</strong>. Wenn Sie
          im Rauschen kein Gittermuster sehen, drücken Sie die
          <strong>Taste [ ${responseMapping.responses[1]} ]</strong>.
        </p>
        <p>
          Drücken Sie die [ Leertaste ] um fortzufahren
        </p>`;
    },
    choices: [' '],
  };

  // Defines a dynamic trial object, which can be either a left or right tilted
  // grating, or a noise only animation. This is used further down in the code.
  const stimulusTrial = {
    type: GaborStimulusPlugin,
    config: () => {
      const isNoiseTrial: boolean =
        jsPsychInstance.timelineVariable('isNoiseTrial');
      const stimulusTilt: GratingTilt =
        jsPsychInstance.timelineVariable('stimulusTilt');

      // Translate the GratingTilt to degrees
      const stimulusRotation: number =
        stimulusTilt === GratingTilt.Left
          ? 45
          : stimulusTilt === GratingTilt.Right
          ? 135
          : 0;

      return getGaborPluginConfig({
        stimulusSize: STIMULUS_SIZE,
        backgroundNoiseFrames: backgroundNoiseFrames,
        rotation: stimulusRotation,
        choices: responseMapping.responses,
        opacity: isNoiseTrial ? 0 : currentGratingVisibility,
      });
    },
    on_finish: (data: any) => {
      // Figure out which response would be correct during this specific trial
      const isNoiseTrial = jsPsychInstance.timelineVariable('isNoiseTrial');
      const correctResponse = isNoiseTrial
        ? responseMapping.responses[1]
        : responseMapping.responses[0];
      // Compare correct to actual response and store
      data.correct = jsPsychInstance.pluginAPI.compareKeys(
        data.response,
        correctResponse
      );
      // Also add correct response
      data.correct_response = correctResponse;
      // Add a test_part label to the data object to be able to identify trials
      // later on.
      data.test_part = 'staircase_test';
    },
    post_trial_gap: () => {
      // Pick an inter trial interval between 600s and 1200ms
      const iti = Math.floor(Math.random() * 1201 + 600);
      return iti;
    },
  };

  // Define one cycle
  // The grating animation trial are carried out once with noiseOnly set to
  // true, meaning there will be no grating appearing in the noise, and once
  // with noiseOnly set to false. This is repeated as specified in the
  // './constants.js' file, and randomized.
  const staircaseCycle = {
    timeline: [fixationCrossTrial, stimulusTrial],
    timeline_variables: [
      {
        isNoiseTrial: true,
      },
      {
        isNoiseTrial: false,
      },
    ],
    sample: {
      type: 'fixed-repetitions',
      // We divide by two beacuse per repetition two trials are carried out
      // (one for each set of timeline variables)
      size: STAIRCASE_TRIALS_PER_CYCLE / 2,
    },
  };

  const logCycleData = {
    type: CallFunctionPlugin,
    func: () => {
      // Do nothing.
    },
    data: () => {
      const { newGratingVisibility, accuracy } = calculateStaircaseStats(
        jsPsychInstance.data.get(),
        currentGratingVisibility
      );
      return {
        test_part: 'staircase_cycle_data_log',
        accuracy,
        newGratingVisibility,
      };
    },
  };

  // Loop the staircaseCycle as many times as defined in './constants.js'. If
  // the desired numbers of runs is reached, store the final data.
  const staircaseCycleLoop = {
    timeline: [staircaseCycle, logCycleData],
    loop_function: (data: any) => {
      // Increase cycle count
      cyclesCarriedOut++;
      // Check if another cycle should be carried out
      if (cyclesCarriedOut >= STAIRCASE_CYCLES) {
        // If the finished cycle presented left tilted gratings
        if (
          jsPsychInstance.timelineVariable('stimulusTilt') === GratingTilt.Left
        ) {
          // Store the according visibility level in a data property
          jsPsychInstance.data.addProperties({
            detection_threshold_left_tilt: currentGratingVisibility,
          });
          // Also store it in the RAM (participantGratingVisibility object)
          participantVisibilityThreshold.setThresholdLeftTilt(
            currentGratingVisibility
          );
        } else {
          // If, however, right tilted gratings were presented, also store, but
          // in different property, of course.
          jsPsychInstance.data.addProperties({
            detection_threshold_right_tilt: currentGratingVisibility,
          });
          // Also store it in the RAM (participantGratingVisibility object)
          participantVisibilityThreshold.setThresholdRightTilt(
            currentGratingVisibility
          );
        }

        // Reset gratingVisibility and the cycles count and stop this block
        cyclesCarriedOut = 0;
        currentGratingVisibility = GRATING_VISIBILITY_LEVEL_INIT;
        return false;
      }

      // Calculate accuracy and adjusted grating visibility level
      const { newGratingVisibility } = calculateStaircaseStats(
        data,
        currentGratingVisibility
      );
      // And set it accordingly
      currentGratingVisibility = newGratingVisibility;

      // Then continue the loop
      return true;
    },
  };

  // Here the cycle loop is carried out two times with different grating tilt.
  const staircaseBlockProcedure = {
    timeline: [staircaseBlockInstruction, staircaseCycleLoop],
    // Define the two tilts as timeline variables which chan then be accessed
    // by each block and cycle
    timeline_variables: [
      {
        stimulusTilt: GratingTilt.Left,
      },
      {
        stimulusTilt: GratingTilt.Right,
      },
    ],
    // Randomize which tilt comes first
    randomize_order: true,
  };
  timeline.push(staircaseBlockProcedure);

  // Return a jsPsych nested timeline object
  return {
    timeline,
  };
};
