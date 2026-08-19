'use strict';

const NodeCache = require('node-cache');
const logger = require('../../config/logger');

class ShipCache {
  constructor() {
    // Standard TTL is 10 minutes (600s), check period 120s
    this.cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
  }

  get(key) {
    const value = this.cache.get(key);
    if (value) {
      logger.info(`[SHIP Analytics] Cache hit: ${key}`);
    } else {
      logger.info(`[SHIP Analytics] Cache miss: ${key}`);
    }
    return value;
  }

  set(key, value, ttl = 600) {
    this.cache.set(key, value, ttl);
  }

  del(key) {
    this.cache.del(key);
  }

  flush() {
    this.cache.flushAll();
    logger.info('[SHIP Analytics] Cache flushed');
  }
}

module.exports = new ShipCache();
