'use strict';

const RandomSamplingStrategy = require('./randomSampling.strategy');

class SamplingStrategyFactory {
  static getStrategy(strategyName = 'RANDOM') {
    switch (strategyName.toUpperCase()) {
      case 'RANDOM':
        return new RandomSamplingStrategy();
      // Future strategies can be added here
      // case 'STRATIFIED':
      //   return new StratifiedSamplingStrategy();
      default:
        return new RandomSamplingStrategy();
    }
  }
}

module.exports = SamplingStrategyFactory;
