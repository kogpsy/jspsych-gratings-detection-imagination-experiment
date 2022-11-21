/**
 * @title IMADET Experiment 3 Refined
 * @description Code for a refined replication of the third experiment of the IMADET study by Dijkstra et al. (2021).
 * @version 0.9.1
 *
 * The following lines specify which media directories will be packaged and
 * preloaded by jsPsych. Modify them to arbitrary paths (or comma-separated
 * lists of paths) within the `media` directory, or just delete them.
 * @assets media/images
 */

// Terser requires license comments not to be in the toplevel scope, which is
// why we need to create a function to make terser extract to comment.
export function licenseComment() {
  /*! **************************************************************************
  Copyright © Robin Bürkli and the University of Bern

  This software is released under the MIT license:

  ---
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the “Software”), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  ---

  License notices from modules used in this project are listed below.
  *************************************************************************** */
}

// Import stylesheets (.scss or .css).
import '../styles/main.scss';

// Import jsPsych
import { initJsPsych } from 'jspsych';

// Import jsPsych plugins
import PreloadPlugin from '@jspsych/plugin-preload';
import { generateNoiseFrames } from '@kogpsy/jspsych-gabor-stimulus-plugin';
import { getFixationCross, getRandomResponseMapping } from './utils';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import { BACKGROUND_ANIMATION_FRAME_NUMBER, STIMULUS_SIZE } from './constants';
import { getPraciceDetectionTimeline } from './practiceDetectionTimeline';
import { getPracticeImaginationTimeline } from './practiceImaginationTimeline';
import { getMainExperimentTimeline } from './mainExperimentTimeline';
import SurveyHtmlFormPlugin from '@jspsych/plugin-survey-html-form';
import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import { generateVviqTimeline } from '@kogpsy/jspsych-vviq';

// Hide mouse cursor if idle for 1s
let hideMouseTimeout: NodeJS.Timeout;
const hideCursor = () => {
  document.body.style.cursor = 'none';
};
const handleMouseMove = () => {
  document.body.style.cursor = '';
  clearTimeout(hideMouseTimeout);
  hideMouseTimeout = setTimeout(hideCursor, 1000);
};
document.addEventListener('mousemove', handleMouseMove);

/**
 * This method will be executed by jsPsych Builder and is expected to run the
 * jsPsych experiment
 *
 * @param {object} options Options provided by jsPsych Builder
 * @param {any} [options.input] A custom object that can be specified via the
 * JATOS web interface ("JSON study input").
 * @param {"development"|"production"|"jatos"} options.environment The context
 * in which the experiment is run: `development` for `jspsych run`, `production`
 * for `jspsych build`, and "jatos" if served by JATOS
 * @param {{images: string[]; audio: string[]; video: string[];, misc:
 * string[];}} options.assetPaths An object with lists of file paths for the
 * respective `@...Dir` pragmas
 */
export async function run({ assetPaths, input = {}, environment }) {
  // Initiate the jsPsych object
  const jsPsych = initJsPsych();

  // Generate and save participant ID
  const participantId = new Date().valueOf();
  jsPsych.data.addProperties({
    participant_id: participantId,
  });

  // Define the main timeline array
  const timeline: any[] = [];

  // Instantiate fixation cross trial
  const fixationCrossTrial = getFixationCross();

  // Generate response mapping
  const responseMapping = getRandomResponseMapping();

  // Generate noise frames for stimulus background
  const backgroundNoiseFrames = generateNoiseFrames(
    STIMULUS_SIZE,
    STIMULUS_SIZE,
    BACKGROUND_ANIMATION_FRAME_NUMBER
  );

  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: [...backgroundNoiseFrames, [...assetPaths.images]],
  });

  timeline.push({
    type: FullscreenPlugin,
    message:
      '<p>Das Experiment wechselt in den Vollbildmodus, wenn Sie den Button drücken.</p>',
    button_label: 'OK',
  });

  // First trial presenting participant id and informing about rights
  timeline.push({
    type: SurveyHtmlFormPlugin,
    html: `<h3>Willkommen</h3>
    <p>
      Vielen Dank, dass Sie an der Studie teilnehmen. Zunächst werden Sie ein paar
      Informationen zum Datenschutz und zu Ihren Rechten erhalten.
    </p>
    <p>
      Die Daten, welche wir durch Ihre Teilnahme erheben, werden innerhalb der
      Schweiz auf einem Server der Universität Bern gespeichert. Sie sind
      anonymisiert, sodass keine Rückschlüsse auf Ihre Person möglich sind.
    </p>
    <p>
      Sie dürfen die Studie jederzeit abbrechen, ohne, dass Ihnen daraus Nachteile
      entstehen. Ihre Daten werden nicht verwendet, wenn Sie die Studie nicht
      abschliessen.
    </p>
    <p>
      Falls Sie zu einem späteren Zeitpunkt möchten, dass Ihre Daten doch nicht
      verwendet werden, können Sie ohne Konsequenzen eine Löschung beantragen.
      Kontaktieren Sie dafür bitte die Studienleitung.
    </p>
    <p>
      Damit wir Ihre (anonymisierten) Daten in diesem Fall identifizieren können,
      werden sie mit einer einzigartigen ID versehen. Diese ID wird Ihnen jetzt
      <strong>genau einmal</strong> angezeigt. Bitte notieren Sie diese für den
      Fall, dass Sie ihre Daten später löschen lassen möchten.
    </p>
    <p>ID: <strong>${participantId}</strong></p>
    <p>
      <label>
        <input
          name="checkbox_agree"
          id="checkbox_agree"
          type="checkbox"
          class="checkbox-input"
          required
        />
        Hiermit bestätige ich, dass ich freiwillig an dieser Studie teilnehme, die
        Informationen gelesen und verstanden habe und den Bedingungen zustimme.
        Meine Daten-ID habe ich notiert.
      </label>
    </p>
    <div class="vertical_spacer"></div>
    `,
    button_label: 'Weiter',
  });

  // First trial capturing demographics
  timeline.push({
    type: SurveyHtmlFormPlugin,
    html: `<p>
    Bevor wir mit dem eigentlichen Experiment starten, haben wir noch ein paar
    Fragen zu ihrer Person.
  </p>
  <p>
    <fieldset>
      <legend>Welchem Geschlecht fühlen Sie sich zugehörig?</legend>
      <div>
        <input type="radio" id="option_gender_diverse" name="gender" value="diverse" required>
        <label for="option_gender_diverse">Divers</label>
      </div>
      <div>
        <input type="radio" id="option_gender_female" name="gender" value="female" required>
        <label for="option_gender_female">Weiblich</label>
      </div>
      <div>
        <input type="radio" id="option_gender_male" name="gender" value="male" required>
        <label for="option_gender_male">Männlich</label>
      </div>
    </fieldset>
    <div class="vertical_spacer"></div>
    <fieldset>
      <legend>Wie alt sind Sie in Jahren?</legend>
      <div>
        <input type="number" id="age" name="age" required>
      </div>
    </fieldset>
    <div class="vertical_spacer"></div>
    <fieldset>
      <legend>Wie ist Ihre Händigkeit?</legend>
      <div>
        <input type="radio" id="option_handedness_left" name="handedness" value="left" required>
        <label for="option_handedness_left">Linkshändig</label>
      </div>
      <div>
        <input type="radio" id="option_handedness_right" name="handedness" value="right" required>
        <label for="option_handedness_right">Rechtshändig</label>
      </div>
      <div>
        <input type="radio" id="option_handedness_both" name="handedness" value="both" required>
        <label for="option_handedness_both">Beidhändig</label>
      </div>
    </fieldset>
    <div class="vertical_spacer"></div>
  </p>`,
    button_label: 'Weiter',
    on_finish: (data: any) => {
      jsPsych.data.addProperties(data.response);
    },
  });

  // Add note on VVIQ and VVIQ itself
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<p>
  Zunächst werden Ihnen einige Fragen zu Ihrer Vorstellungskraft gestellt. Es
  geht darum, dass Sie ein Gefühl dafür entwickeln, was Vorstellungskraft ist.
</p>
<p>Drücken Sie die [Leertaste], um fortzufahren.</p>
`,
    choices: [' '],
  });
  timeline.push(generateVviqTimeline('german', { test_part: 'vviq' }));

  // Push the main explanation of the experiment to the timeline
  timeline.push({
    type: HtmlKeyboardResponsePlugin,
    stimulus: `<p>
  Wir werden jetzt zum eigentlichen Teil übergehen. Sie werden im folgenden nach
  <strong>verrauschten Gittermustern</strong> suchen (siehe unten).
</p>
<p>
  <strong>Gittermuster</strong> bestehen aus schwarz-weiss gestreiften Linien
  (links).
</p>
<p>
  Das <strong>Rauschen</strong> ist eine Sammlung von zufällig angeordneten
  schwarzen und weissen Punkten (mitte).
</p>
<p>
  Ihre Aufgabe besteht darin, bei jedem Durchgang anzugeben, ob Sie ein
  Gittermuster gesehen haben oder nicht (rechts).
</p>
<div class="vertical_spacer"></div>
<div class="vertical_spacer"></div>
<img src="media/images/example-stimulus.jpg" width="700" />
<div class="vertical_spacer"></div>
<p>Drücken Sie die [Leertaste], um fortzufahren.</p>
`,
    choices: [' '],
  });

  // Add practice trials
  timeline.push(
    getPracticeDetectionTimeline(
      jsPsych,
      responseMapping,
      backgroundNoiseFrames,
      fixationCrossTrial
    )
  );

  // Add imagination practice sub-timeline
  timeline.push(
    getPracticeImaginationTimeline(
      jsPsych,
      fixationCrossTrial,
      backgroundNoiseFrames
    )
  );

  // Add main experiment sub-timeline
  timeline.push(
    getMainExperimentTimeline(
      jsPsych,
      responseMapping,
      fixationCrossTrial,
      backgroundNoiseFrames
    )
  );

  // Last trial asking final questions
  timeline.push({
    type: SurveyHtmlFormPlugin,
    html: `<p>
  Geschafft. Wir haben noch ein paar abschliessende Fragen an Sie, dann sind wir fertig.
</p>
<p>
  <fieldset>
    <legend>Haben Sie sich die Gittermuster in den Blöcken wirklich vorgestellt,
      als wir Sie darum baten? (Die Antwort auf diese Frage wird Ihre
      Belonung nicht beeinflussen.)</legend>
    <div>
      <input type="radio" id="option_imagination_yes" name="did_participant_really_imagine" value="yes" required>
      <label for="option_imagination_yes">Ja</label>
    </div>
    <div>
      <input type="radio" id="option_imagination_no" name="did_participant_really_imagine" value="no" required>
      <label for="option_imagination_no">Nein</label>
    </div>
  </fieldset>
  <div class="vertical_spacer"></div>
  <fieldset>
    <legend>Haben Sie das Gefühl, dass sich das Vorstellen der Gittermuster auf
      Ihre Antworten bei der Aufgabe ausgewirkt hat?</legend>
    <div>
      <input type="radio" id="option_influence_feeling_yes" name="did_participant_feel_influence_of_imagination" value="yes" required>
      <label for="option_influence_feeling_yes">Ja</label>
    </div>
    <div>
      <input type="radio" id="option_influence_feeling_no" name="did_participant_feel_influence_of_imagination" value="no" required>
      <label for="option_influence_feeling_no">Nein</label>
    </div>
    <div>
      <div class="vertical_spacer"></div>
      <div>Inwiefern?</div>
      <textarea name="did_participant_feel_influence_of_imagination_explanation"></textarea>
    </div>
  </fieldset>
</p>
<p>Klicken Sie auf weiter, um Ihre Daten einzureichen.</p> `,
    button_label: 'Weiter',
    data: {
      test_part: 'survey_post',
    },
    on_finish: (data: any) => {
      jsPsych.data.addProperties(data.response);
    },
  });

  // Run the experiment
  await jsPsych.run(timeline);

  // Get the resulting data
  const resultData = jsPsych.data.get();

  // Do some cleanup
  const cleanData = resultData
    .filterCustom((trial) => {
      return trial.test_part !== undefined;
    })
    .filterColumns([
      'participant_id',
      'gender',
      'age',
      'handedness',
      'response',
      'correct',
      'correct_response',
      'visibility',
      'stimulus',
      'rt',
      'test_part',
      'did_participant_really_imagine',
      'did_participant_feel_influence_of_imagination',
      'did_participant_feel_influence_of_imagination_explanation',
    ]);

  // If the experiment is run by JATOS, pass the resulting data to the server
  // in CSV form.
  if (environment === 'jatos') {
    // Some editors may throw errors here if TypeScript is used, since the jatos
    // object is not created here but injected at runtime. This is why for the
    // following line, TypeScript errors are ignored.
    // @ts-ignore
    jatos.submitResultData(cleanData.json(), jatos.startNextComponent);
  }
  // In every other environment, print the data to the browser console in JSON
  // form. Here you can adjust what should happen to the data if the experiment
  // is served, e.g. by a common httpd server.
  else {
    // Trigger browser download
    cleanData.localSave('json', 'data.json');
    // And log to console
    console.log('End of experiment. Results:');
    console.log(cleanData);
  }
}
