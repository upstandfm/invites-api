'use strict';

module.exports = {
  invalid: {
    Records: [
      {
        eventName: 'BLOCKCHAIN',
        eventVersion: 'v9876.3466.19192',
        eventSource: 'alpha-centauri',
        dynamodb: {
          StreamViewType: 'FULL_STEAM_AHEAD'
        }
      }
    ]
  },
  insert: {
    Records: [
      {
        eventID: '46e6ed491c6468497e2d6',
        eventName: 'INSERT',
        eventVersion: '1.1',
        eventSource: 'aws:dynamodb',
        awsRegion: 'eu-central-1',
        dynamodb: {
          ApproximateCreationDateTime: 1581953133,
          Keys: {
            sk: {
              S: 'invite#daniel@upstand.fm'
            },
            pk: {
              S: 'workspace#Xq5rf3D'
            }
          },
          NewImage: {
            createdAt: {
              S: '2020-02-17T15:25:32.820Z'
            },
            createdBy: {
              S: 'user|5d585e4c880c0e7821ef6a'
            },
            sk: {
              S: 'invite#daniel@upstand.fm'
            },
            id: {
              S: 'IGJcH5FB'
            },
            pk: {
              S: 'workspace#Xq5rf3D'
            },
            inviterFullName: {
              S: 'Rick Sanchez'
            },
            email: {
              S: 'daniel@upstand.fm'
            },
            status: {
              S: 'pending'
            },
            updatedAt: {
              S: '2020-02-17T15:25:32.820Z'
            },
            workspaceId: {
              S: 'Xq5rf3D'
            }
          },
          SequenceNumber: '84700000000861893',
          SizeBytes: 297,
          StreamViewType: 'NEW_AND_OLD_IMAGES'
        },
        eventSourceARN:
          'arn:aws:dynamodb:eu-central-1:57573759583:table/Invites/stream/2020-01-02T11:12:39.588'
      }
    ]
  },
  remove: {
    Records: [
      {
        eventID: '66475756747ef34ae4f614545e53',
        eventName: 'REMOVE',
        eventVersion: '1.1',
        eventSource: 'aws:dynamodb',
        awsRegion: 'eu-central-1',
        dynamodb: {
          ApproximateCreationDateTime: 1581953177,
          Keys: {
            sk: {
              S: 'invite#daniel@upstand.fm'
            },
            pk: {
              S: 'workspace#Xq5rf3D'
            }
          },
          OldImage: {
            createdAt: {
              S: '2020-02-17T15:25:32.820Z'
            },
            createdBy: {
              S: 'user|5d585e4c880c0e7821ef6a'
            },
            sk: {
              S: 'invite#daniel@upstand.fm'
            },
            id: {
              S: 'IGJcH5FB'
            },
            pk: {
              S: 'workspace#Xq5rf3D'
            },
            inviterFullName: {
              S: 'Rick Sanchez'
            },
            email: {
              S: 'daniel@upstand.fm'
            },
            status: {
              S: 'pending'
            },
            updatedAt: {
              S: '2020-02-17T15:25:32.820Z'
            },
            workspaceId: {
              S: 'Xq5rf3D'
            }
          },
          SequenceNumber: '84700000000861894',
          SizeBytes: 297,
          StreamViewType: 'NEW_AND_OLD_IMAGES'
        },
        eventSourceARN:
          'arn:aws:dynamodb:eu-central-1:57573759583:table/Invites/stream/2020-01-02T11:12:39.588'
      }
    ]
  }
};
