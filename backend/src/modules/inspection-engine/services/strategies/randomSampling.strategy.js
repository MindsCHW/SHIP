'use strict';

class RandomSamplingStrategy {
  /**
   * Randomly selects a percentage of the given population.
   * @param {Array} masterListPopulation - The complete list of available questions for the project.
   * @param {Number} percentage - The percentage to sample (e.g., 10 for 10%).
   * @returns {Array} The selected sample.
   */
  sample(masterListPopulation, percentage) {
    if (!masterListPopulation || masterListPopulation.length === 0) return [];
    if (percentage <= 0) return [];
    if (percentage >= 100) return masterListPopulation;

    // Calculate how many items to pick
    const sampleSize = Math.ceil((masterListPopulation.length * percentage) / 100);

    // Shuffle array using Fisher-Yates and pick the first `sampleSize` elements
    const shuffled = [...masterListPopulation];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, sampleSize);
  }
}

module.exports = RandomSamplingStrategy;
