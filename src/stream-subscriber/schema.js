'use strict';

const Joi = require('@hapi/joi');

const defaultJoi = Joi.defaults(_schema =>
  _schema.options({
    stripUnknown: true
  })
);

const _StreamRecordSchema = defaultJoi.object().keys({
  eventID: Joi.string().required(),
  eventName: Joi.string()
    .required()
    .valid('INSERT', 'MODIFY', 'REMOVE'),

  eventVersion: Joi.string()
    .required()
    .valid('1.1'),

  eventSource: Joi.string()
    .required()
    .valid('aws:dynamodb'),

  awsRegion: Joi.string().required(),
  dynamodb: {
    ApproximateCreationDateTime: Joi.number().required(),
    Keys: defaultJoi.object(),
    NewImage: defaultJoi.object(),
    OldImage: defaultJoi.object(),
    SequenceNumber: Joi.string().required(),
    SizeBytes: Joi.number().required(),
    StreamViewType: Joi.string()
      .required()
      .valid('NEW_AND_OLD_IMAGES', 'NEW_IMAGE', 'OLD_IMAGE')
  },
  eventSourceARN: Joi.string().required()
});

function _validate(data, schema) {
  const { error: joiErr, value } = schema.validate(data);

  // For Joi "error" see:
  // https://github.com/hapijs/joi/blob/master/API.md#validationerror
  if (joiErr) {
    throw joiErr;
  }

  return value;
}

module.exports = {
  validateRecord(data = {}) {
    return _validate(data, _StreamRecordSchema);
  }
};
