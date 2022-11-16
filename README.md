# jspsych-gratings-detection-imagination-experiment

Code for a refined replication of Dijkstra et al., 2022. Heavily based on [imadet-experiment-3-refined][1].

## TODO

- Port main part (no threshold anymore, update initial instruction, ...)
- Final questionnaire
- Test run

## Changes that have been made

### Stimuli

In the original study, gabor patches - the main stimuli - are faded in during a 2 second period in front of an animated noise background. After the 2 seconds, a response screen is displayed. In that way, it is practically impossible to analyse reaction times. This has been changed. The stimuli are still displayed in front of an animated noise background, but their visibility is stable, and they are displayed until the participant responds.

The stimuli themselves were also changed out. The gabor patches used in the original study are not really sinusoidal and the aperture applied does not seem to be blurred in a Gaussian way. They were replaced by more typical gabor patches found in experiments on perception. jspsych-gabor-stimulus-plugin was used to generate them.

### Timing

Since the stimuli are no longer displayed for a fixed amount of time, the next stimulus is displayed right after the response (with a 200ms fixation cross in between). This makes the experiment quite hectic, which is why an inter trial interval was introduced. It is a randomly chosen interval between 600ms and 2000ms.

[1]: [https://github.com/kogpsy/imadet-experiment-3-refined]
