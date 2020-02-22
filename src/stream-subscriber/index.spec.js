'use strict';

const createStreamSubscriber = require('.');
const fakeEvents = require('./fake-events');

describe('Stream subscriber service', () => {
  describe('createStreamSubscriber(publisher, options)', () => {
    it('throws without publisher service', () => {
      expect(() => {
        createStreamSubscriber();
      }).toThrowError(/^Provide a publisher service$/);
    });

    it('throws without unmarshall function', () => {
      expect(() => {
        const fakePublisher = {};
        createStreamSubscriber(fakePublisher, {});
      }).toThrowError(/^Provide a function to unmarshall DynamoDB records$/);
    });

    it('throws when unmarshall is not a function', () => {
      expect(() => {
        const fakePublisher = {};
        createStreamSubscriber(fakePublisher, {
          unmarshall: 'Invalid value'
        });
      }).toThrowError(/^Provide a function to unmarshall DynamoDB records$/);
    });

    it('throws without "onInsert" topic', () => {
      expect(() => {
        const fakePublisher = {};
        createStreamSubscriber(fakePublisher, {
          unmarshall: () => undefined,
          topics: {}
        });
      }).toThrowError(
        /^Provide a topic to send messages to when an item is inserted to DynamoDB$/
      );
    });

    it('creates service with correct values', () => {
      expect(() => {
        const fakePublisher = {};
        createStreamSubscriber(fakePublisher, {
          unmarshall: () => undefined,
          topics: {
            onInsert: 'fake:topic:address:insert:1234',
            onRemove: 'fake:topic:address:remove:5678'
          }
        });
      }).not.toThrowError();
    });
  });

  describe('streamSubscriber.publishRecords(event, context)', () => {
    it('handles error when processing a record fails', () => {
      const fakePublisher = {
        sendMessage: jest.fn()
      };

      const streamSubscriber = createStreamSubscriber(fakePublisher, {
        unmarshall: jest.fn(d => d),
        topics: {
          onInsert: 'fake:topic:address:insert:1234',
          onRemove: 'fake:topic:address:remove:5678'
        }
      });

      const fakeErrHandler = jest.fn();

      const fakeContext = {
        captureError: fakeErrHandler
      };
      streamSubscriber.publishRecords(fakeEvents.invalid, fakeContext);

      expect(fakeErrHandler.mock.calls.length).toBe(1);
    });

    it('unmarshalls an inserted record, and sends it as a message', () => {
      const fakePublisher = {
        sendMessage: jest.fn(() => {
          const fakeRes = { MessageId: '1234ea56f789' };
          return Promise.resolve(fakeRes);
        })
      };

      const fakeUnmarshall = jest.fn(d => d);

      const fakeInsertTopic = 'fake:topic:address:insert:1234';
      const fakeRemoveTopic = 'fake:topic:address:remove:5678';

      const streamSubscriber = createStreamSubscriber(fakePublisher, {
        unmarshall: fakeUnmarshall,
        topics: {
          onInsert: fakeInsertTopic,
          onRemove: fakeRemoveTopic
        }
      });

      const fakeContext = {};
      streamSubscriber.publishRecords(fakeEvents.insert, fakeContext);

      const newImage = fakeEvents.insert.Records[0].dynamodb.NewImage;

      expect(fakeUnmarshall.mock.calls.length).toBe(1);
      // Check unmarshall is called with the new image
      expect(fakeUnmarshall.mock.calls[0][0]).toBe(newImage);

      expect(fakePublisher.sendMessage.mock.calls.length).toBe(1);
      // Check if sendMessage is called with the topic address
      expect(fakePublisher.sendMessage.mock.calls[0][0]).toBe(fakeInsertTopic);
      // Check if sendMessage is called with the new image
      expect(fakePublisher.sendMessage.mock.calls[0][1]).toBe(newImage);
    });

    it('unmarshalls a removed record, and sends it as a message', () => {
      const fakePublisher = {
        sendMessage: jest.fn(() => {
          const fakeRes = { MessageId: '1234ea56f789' };
          return Promise.resolve(fakeRes);
        })
      };

      const fakeUnmarshall = jest.fn(d => d);

      const fakeInsertTopic = 'fake:topic:address:insert:1234';
      const fakeRemoveTopic = 'fake:topic:address:remove:5678';

      const streamSubscriber = createStreamSubscriber(fakePublisher, {
        unmarshall: fakeUnmarshall,
        topics: {
          onInsert: fakeInsertTopic,
          onRemove: fakeRemoveTopic
        }
      });

      const fakeContext = {};
      streamSubscriber.publishRecords(fakeEvents.remove, fakeContext);

      const oldImage = fakeEvents.remove.Records[0].dynamodb.OldImage;

      expect(fakeUnmarshall.mock.calls.length).toBe(1);
      // Check unmarshall is called with the old image
      expect(fakeUnmarshall.mock.calls[0][0]).toBe(oldImage);

      expect(fakePublisher.sendMessage.mock.calls.length).toBe(1);
      // Check if sendMessage is called with the topic address
      expect(fakePublisher.sendMessage.mock.calls[0][0]).toBe(fakeRemoveTopic);
      // Check if sendMessage is called with the old image
      expect(fakePublisher.sendMessage.mock.calls[0][1]).toBe(oldImage);
    });
  });
});
