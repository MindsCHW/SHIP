'use strict';

const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    samplingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sampling',
      required: [true, 'Sampling ID is required'],
      index: true
    },
    ratingValue: {
      type: Number,
      enum: {
        values: [0, 1, 5, 10],
        message: 'Rating must be 0, 1, 5, or 10'
      },
      required: true
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rater ID is required']
    },
    ratedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
