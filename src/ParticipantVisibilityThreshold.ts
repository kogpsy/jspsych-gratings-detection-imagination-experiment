import { GRATING_VISIBILITY_LEVEL_INIT } from './constants';

class ParticipantVisibilityThreshold {
  // Class variables for individual thresholds
  private thresholdLeftTilt: number;
  private thresholdRightTilt: number;

  /**
   * Creates an instance of ParticipantVisibilityThreshold.
   *
   * Initial thresholds can be provided for left and right tilted gratings. If
   * they are set to 'undefined', the default value for initial visibility is
   * used.
   *
   * @param initThresholdLeftTilt Optionally set initial participant visibility
   * threshold for left tilted gratings
   * @param initThresholdRightTilt Optionally set initial participant visibility
   * threshold for right tilted gratings
   */
  constructor(
    initThresholdLeftTilt: number | undefined,
    initThresholdRightTilt: number | undefined
  ) {
    if (initThresholdLeftTilt === undefined) {
      this.thresholdLeftTilt = GRATING_VISIBILITY_LEVEL_INIT;
    } else {
      this.thresholdLeftTilt = initThresholdLeftTilt;
    }
    if (initThresholdRightTilt === undefined) {
      this.thresholdRightTilt = GRATING_VISIBILITY_LEVEL_INIT;
    } else {
      this.thresholdRightTilt = initThresholdRightTilt;
    }
  }

  /**
   * Sets a new threshold for right tilted gratings
   *
   * @param newThreshold The new threshold
   */
  setThresholdLeftTilt(newThreshold: number) {
    this.thresholdLeftTilt = newThreshold;
  }

  /**
   * Sets a new threshold for left tilted gratings
   *
   * @param newThreshold The new threshodld
   */
  setThresholdRightTilt(newThreshold: number) {
    this.thresholdRightTilt = newThreshold;
  }

  /**
   * Get the current threshold for left tilted gratings
   *
   * @returns Threshold
   */
  getThresholdLeftTilt() {
    return this.thresholdLeftTilt;
  }

  /**
   * Get the current threshold for right tilted gratings
   *
   * @returns Threshold
   */
  getThresholdRightTilt() {
    return this.thresholdRightTilt;
  }
}

export { ParticipantVisibilityThreshold };
