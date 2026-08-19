'use strict';

const User = require('../../../models/User.model');

class UserRepository {
  async aggregateUsers(pipeline) {
    return await User.aggregate(pipeline);
  }

  async findUsers(filter = {}) {
    return await User.find(filter).lean();
  }
}

module.exports = new UserRepository();
