const { expect } = require('chai')
const test = require('firebase-functions-test')({
  projectId: process.env.GCLOUD_PROJECT
})
const { waitForCloudFunction } = require('./wait')
const { PlayerProfile, Lobby, PlayerRole } = require('../models')

const admin = require('../admin')
admin.init()

const db = admin.getFirestore()

const lobbyReference = db
  .collection('lobbies')
  .withConverter(Lobby.firestoreConverter)
  .doc('AAAA')

const playerProfilesReference = lobbyReference
  .collection('playerProfiles')
  .withConverter(PlayerProfile.firestoreConverter)

describe('Game creation', () => {
  after(test.cleanup)

  before(async () => {
    await lobbyReference
      .create(
        new Lobby(
          'AAAA',
          new Date(),
          'creatorUID',
          null
        )
      )
  })

  it('should create the game, move the ready players into it and kick the rest from the lobby', async () => {
    const idlePlayerUID = 'idle'
    const thiefUID = 'thief'
    const detectiveUID = 'detective'

    await playerProfilesReference
      .doc(idlePlayerUID)
      .create(
        new PlayerProfile(
          idlePlayerUID,
          new Date(),
          false,
          null
        )
      )

    await playerProfilesReference
      .doc(thiefUID)
      .create(
        new PlayerProfile(
          thiefUID,
          new Date(),
          false,
          PlayerRole.THIEF
        )
      )

    await playerProfilesReference
      .doc(detectiveUID)
      .create(
        new PlayerProfile(
          detectiveUID,
          new Date(),
          false,
          PlayerRole.DETECTIVE
        )
      )

    // should NOT trigger the function - only 1 player ready
    await playerProfilesReference
      .doc(thiefUID)
      .update({ isReady: true })

    await waitForCloudFunction()

    const idleUserProfileBefore = await playerProfilesReference.doc(idlePlayerUID).get()
    expect(idleUserProfileBefore.exists).to.be.true
    const lobbyBefore = await lobbyReference.get()
    expect(lobbyBefore.data().gameUID).to.be.null

    // should trigger the function - 2 players ready
    await playerProfilesReference
      .doc(detectiveUID)
      .update({ isReady: true })

    await waitForCloudFunction()

    // should set the game UID
    const lobbyAfter = await lobbyReference.get()
    const gameUID = lobbyAfter.data().gameUID
    expect(gameUID).to.not.be.null

    // should move the players into the game
    const thiefPlayer = await db.collection(`games/${gameUID}/players`).doc(thiefUID).get()
    const detectivePlayer = await db.collection(`games/${gameUID}/players`).doc(thiefUID).get()
    expect(thiefPlayer.exists).to.be.true
    expect(detectivePlayer.exists).to.be.true

    // should kick the idle player profile from the lobby
    const idleUserProfileAfter = await playerProfilesReference.doc(idlePlayerUID).get()
    expect(idleUserProfileAfter.exists).to.be.false
  }).timeout(10000)
})
