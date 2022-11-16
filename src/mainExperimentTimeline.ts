/*
 * imadet-replication-experiment-3
 *
 * Author: Robin Bürkli <robuba.jr@gmx.ch>
 * License: MIT
 *
 * This file contains the timeline of the main experiment.
 */

// Import plugins
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import CallFunctionPlugin from '@jspsych/plugin-call-function';
// Import constants
import {
  MAIN_EXPERIMENT_CONDITION_REPETITIONS,
  MAIN_EXPERIMENT_TRIALS_PER_CONDITION,
  STIMULUS_SIZE,
} from './constants';
import { JsPsych } from 'jspsych';
import { getGaborPluginConfig, ResponseMapping } from './utils';
import { ParticipantVisibilityThreshold } from './ParticipantVisibilityThreshold';
import GaborStimulusPlugin from '@kogpsy/jspsych-gabor-stimulus-plugin';
import { DataCollection } from 'jspsych/dist/modules/data/DataCollection';

/**
 * Builds the timeline for the main part of the experiment.
 *
 * @param jsPsychInstance The jsPsych instance to be used
 * @param responseMapping An object containing the response mapping for
 * the current experimental session
 * @param fixationCrossTrial A jsPsych trial which briefly shows a fixation
 * cross
 * @param participantVisibilityThreshold A "shared" object which holds
 * the grating visibility levels of the current participant.
 * @returns A jsPsych nested timeline
 */
export const getMainExperimentTimeline = (
  jsPsychInstance: JsPsych,
  responseMapping: ResponseMapping,
  fixationCrossTrial: any,
  backgroundNoiseFrames: string[],
  participantVisibilityThreshold: ParticipantVisibilityThreshold
) => {
  // Declare and initiate a timeline array
  let timeline: any[] = [];

  // Define a counter to keep track of the currently carried out block
  let blockCounter = 0;

  // Define the main instruction
  const mainInstruction = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <p>
        Wir werden nun zum Hauptteil dieses Experiments übergehen.
      </p>
      <p>
        Es wird insgesamt ${6 * MAIN_EXPERIMENT_CONDITION_REPETITIONS} kurze
        Blöcke geben. Während jedes Blocks wird bei 75% der Durchgänge ein
        Gittermuster einer Orientierung angezeigt werden. Bei einigen Blöcken
        werden Sie gebeten, sich entweder ein nach links oder ein nach rechts
        geneigtes Gittermuster, oder gar nichts vorzustellen. Bitte stellen Sie
        sich das Gitter so lebhaft wie möglich vor, so als ob es tatsächlich auf
        dem Bildschirm zu sehen wäre.
      </p>
      <p>
        Ihre Aufgabe ist es, anzugeben, ob ein Gittermuster vorhanden war oder
        nicht.
      </p>
      <p>
        Wenn Sie möchten, können Sie zu Beginn eines neuen Blocks jederzeit eine
        kurze Pause einlegen.
      </p>
      <div class="vertiacl_spacer"></div>
      <p> Drücken Sie die [ Leertatse ] um fortzufahren. </p>`,
    choices: [' '],
  };
  timeline.push(mainInstruction);

  // Define the instruction for each block
  const blockInstruction = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: () => {
      const instructionTilt = jsPsychInstance.timelineVariable(
        'blockInstructionTilt'
      );
      const instructionImage = jsPsychInstance.timelineVariable(
        'blockInstructionImage'
      );
      const instructionImagination = jsPsychInstance.timelineVariable(
        'blockInstructionImagination'
      );

      return `
        <p>
          Dies ist Block ${blockCounter + 1} von
          ${6 * MAIN_EXPERIMENT_CONDITION_REPETITIONS}.
        </p> 
        <p>
          Während diesem Block werden Sie nach ${instructionTilt} geneigte
          Gittermuster sehen.
        </p>
        <p>
          Bitte stellen Sie sich bei jedem Durchgang ${instructionImagination}
          vor.
        </p>
        <p> Bei 75% der Durchgänge wird ein Gittermuster angezeigt werden. </p>
        <div class="vertical_spacer"></div>
        <img src="${instructionImage}" />
        <p>
          Zur Erinnerung:
        </p>
        <p>
          Wenn Sie im Rauschen ein Gittermuster sehen, drücken Sie
          die <strong>Taste [ ${
            responseMapping.responses[0]
          } ]</strong>. Wenn Sie
          im Rauschen kein Gittermuster sehen, drücken Sie die
          <strong>Taste [ ${responseMapping.responses[1]} ]</strong>.
        </p>
        <div class="vertical_spacer"></div>
        <p> Drücken Sie die [ Leertaste ] um fortzufahren. </p>
      `;
    },
    choices: [' '],
  };

  // In each block, a number of animations will be shown, these are defined here
  // in the form of a dynamic trial which will change depending on timeline
  // variables.
  const stimulusTrial = {
    type: GaborStimulusPlugin,
    config: () => {
      // First, the required timeline variables are grabbed, and function level
      // variables are declared.
      let stimulusOpacity = 1;
      const isNoiseTrial = jsPsychInstance.timelineVariable('isNoiseTrial');
      // If a noise only animation was requested, return appropriate plugin
      // config
      if (isNoiseTrial) {
        return getGaborPluginConfig({
          stimulusSize: STIMULUS_SIZE,
          backgroundNoiseFrames: backgroundNoiseFrames,
          choices: responseMapping.responses,
          opacity: 0,
          rotation: 0,
        });
      } else {
        // If a grating animation was requested, figure out which one
        const gratingTilt = jsPsychInstance
          .timelineVariable('condition')
          .split('_')[1];
        // A left tilted grating animation was requested
        if (gratingTilt === 'left') {
          // Get the detection threshold of the current participant
          stimulusOpacity =
            participantVisibilityThreshold.getThresholdLeftTilt();
          // Return appropriate config
          return getGaborPluginConfig({
            stimulusSize: STIMULUS_SIZE,
            backgroundNoiseFrames: backgroundNoiseFrames,
            choices: responseMapping.responses,
            opacity: stimulusOpacity,
            rotation: 45,
          });
        }
        // A right tilted grating animation was requested
        else {
          // Get the detection threshold of the current participant
          stimulusOpacity =
            participantVisibilityThreshold.getThresholdRightTilt();
          // Return appropriate config
          return getGaborPluginConfig({
            stimulusSize: STIMULUS_SIZE,
            backgroundNoiseFrames: backgroundNoiseFrames,
            choices: responseMapping.responses,
            opacity: stimulusOpacity,
            rotation: 135,
          });
        }
      }
    },
    on_finish: (data: any) => {
      // Figure out which response would be correct during this specific trial
      const wasNoiseTrial = jsPsychInstance.timelineVariable('isNoiseTrial');
      const correctResponse = wasNoiseTrial
        ? responseMapping.responses[1]
        : responseMapping.responses[0];
      // Compare correct to actual response and store
      data.correct = jsPsychInstance.pluginAPI.compareKeys(
        data.response,
        correctResponse
      );
      // Also add the correct response
      data.correct_response = correctResponse;
      // Add a test_part label to the data object to be able to identify trials
      // later on.
      data.test_part = 'main_test';
      data.condition = jsPsychInstance.timelineVariable('condition');
    },
    post_trial_gap: () => {
      // Pick an inter trial interval between 600s and 1200ms
      const iti = Math.floor(Math.random() * 1201 + 600);
      return iti;
    },
  };

  // The defined animations and their response screen are looped in this object
  const blockLoop = {
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
      size: MAIN_EXPERIMENT_TRIALS_PER_CONDITION / 2,
    },
  };

  // Define the screen to check if the imagery was done correctly.
  // The idea is that the participant is asked about what kind of grating he/she
  // imagined, and then gets feedback about whether this was the correct kind.
  const blockImageryCheck = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: `
      <p> Geschafft! </p>
      <p>
        Haben Sie sich ein Gittermuster vorgestellt während diesem Block?
      </p>
    `,
    prompt:
      'Ja, ein nach links geneigtes [ L ] / Ja, ein nach rechts' +
      ' geneigtes [ R ] / Nein [ N ]',
    choices: ['l', 'r', 'n'],
    on_finish: (data: any) => {
      // First, figure out the correct response based on timeline vars
      let correctResponse: string = '';
      const condition = jsPsychInstance.timelineVariable('condition');
      if (condition.includes('imagine_nothing')) {
        correctResponse = 'n';
      } else if (condition.includes('imagine_left')) {
        correctResponse = 'l';
      } else if (condition.includes('imagine_right')) {
        correctResponse = 'r';
      }
      // Add to the data object if the participant imagined the correct thing
      data.correct = jsPsychInstance.pluginAPI.compareKeys(
        data.response,
        correctResponse
      );
      // Also add correct response
      data.correct_response = correctResponse;
      // Add label about which test part to the data object
      data.test_part = 'main_imagination_check';
    },
  };

  // Define the screen giving feedback about the imagery.
  const blockImageryCheckFeedback = {
    type: HtmlKeyboardResponsePlugin,
    stimulus: () => {
      // Grab the previous trial, which is the check about whether the correct
      // imagination was done.
      const imaginationCheckTrial = jsPsychInstance.data
        .get()
        .last(1)
        .values()[0];

      if (imaginationCheckTrial.correct) {
        return `
          <p> Hervorragend! </p>
          <p> Drücken Sie die [ Leertaste ] um fortzufahren. </p>
        `;
      } else {
        return `
          <p> Das war falsch, bitte lesen Sie die Instruktionen sorgfältig. </p>
          <p> Drücken Sie die [ Leertaste ] um fortzufahren. </p>
        `;
      }
    },
    choices: [' '],
  };

  // Define a trial which does nothing but updating the block counter.
  const updateBlockCounter = {
    type: CallFunctionPlugin,
    func: () => {
      blockCounter++;
    },
  };

  // This is the main block procedure. Here, all the trial objects defined above
  // are connected.
  // There are six different conditions defined as timeline variables, which
  // get randomly sampled further down below.
  const mainBlockProcedure = {
    // These trials get carried out with each of the timeline variables. Sampled
    // as defined below.
    timeline: [
      blockInstruction,
      blockLoop,
      blockImageryCheck,
      blockImageryCheckFeedback,
      updateBlockCounter,
    ],
    timeline_variables: [
      // Example: In this condition, the participant is told that left tilted
      // gratings will appear (this is the truth), and is asked to imagine
      // nothing during the trials.
      {
        condition: 'display_left_imagine_nothing',
        blockInstructionTilt: 'links',
        blockInstructionImage: 'media/images/example-noise-only.jpg',
        blockInstructionImagination: '<strong>nichts</strong>',
      },
      {
        condition: 'display_left_imagine_left',
        blockInstructionTilt: 'links',
        blockInstructionImage: 'media/images/example-grating-left-tilt.jpg',
        blockInstructionImagination:
          '<strong>nach links geneigte Gittermuster</strong> (siehe unten)',
      },
      {
        condition: 'display_left_imagine_right',
        blockInstructionTilt: 'links',
        blockInstructionImage: 'media/images/example-grating-right-tilt.jpg',
        blockInstructionImagination:
          '<strong>nach rechts geneigte Gittermuster</strong> (siehe unten)',
      },
      {
        condition: 'display_right_imagine_nothing',
        blockInstructionTilt: 'rechts',
        blockInstructionImage: 'media/images/example-noise-only.jpg',
        blockInstructionImagination: '<strong>nichts</strong>',
      },
      {
        condition: 'display_right_imagine_left',
        blockInstructionTilt: 'rechts',
        blockInstructionImage: 'media/images/example-grating-left-tilt.jpg',
        blockInstructionImagination:
          '<strong>nach links geneigte Gittermuster</strong> (siehe unten)',
      },
      {
        condition: 'display_right_imagine_right',
        blockInstructionTilt: 'rechts',
        blockInstructionImage: 'media/images/example-grating-right-tilt.jpg',
        blockInstructionImagination:
          '<strong>nach rechts geneigte Gittermuster</strong> (siehe unten)',
      },
    ],
    // Each of the above defined conditions will be carried out once or multiple
    // times (according to './constants.js') in random order.
    sample: {
      type: 'fixed-repetitions',
      size: MAIN_EXPERIMENT_CONDITION_REPETITIONS,
    },
  };
  timeline.push(mainBlockProcedure);

  // Return a jsPsych nested timeline object
  return {
    timeline,
  };
};
