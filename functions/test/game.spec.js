const { expect } = require('chai')
const test = require('firebase-functions-test')({
  projectId: process.env.GCLOUD_PROJECT
})
const { waitForCloudFunction } = require('./wait')
const { LobbyPlayer, Lobby } = require('../models')

const admin = require('../admin')
admin.init()

const db = admin.getFirestore()

const lobbyReference = db
  .collection('lobbies')
  .withConverter(Lobby.firestoreConverter)
  .doc('AAAA')

const lobbyPlayersReference = lobbyReference
  .collection('players')
  .withConverter(LobbyPlayer.firestoreConverter)

describe('Game creation', () => {
  after(test.cleanup)

  before(async () => {
    await lobbyReference
      .create(
        new Lobby(
          'AAAA',
          2,
          new Date(),
          'creatorUID',
          null
        )
      )
  })

  it('should create the game, move the ready players into it and kick the rest from the lobby', async () => {
    const idlePlayerUID = 'idle'
    const player1UID = 'player1'
    const player2UID = 'player2'

    await lobbyPlayersReference
      .doc(idlePlayerUID)
      .create(
        new LobbyPlayer(
          idlePlayerUID,
          new Date()
        )
      )

    await lobbyPlayersReference
      .doc(player1UID)
      .create(
        new LobbyPlayer(
          player1UID,
          new Date()
        )
      )

    await lobbyPlayersReference
      .doc(player2UID)
      .create(
        new LobbyPlayer(
          player2UID,
          new Date()
        )
      )

    // should NOT trigger the function - only 1 player ready
    await lobbyPlayersReference
      .doc(player1UID)
      .update({ color: 1 })

    await waitForCloudFunction()

    const idlePlayerBefore = await lobbyPlayersReference.doc(idlePlayerUID).get()
    expect(idlePlayerBefore.exists).to.be.true
    const lobbyBefore = await lobbyReference.get()
    expect(lobbyBefore.data().gameUID).to.be.null

    // should trigger the function - 2 players ready
    await lobbyPlayersReference
      .doc(player2UID)
      .update({ color: 2 })

    await waitForCloudFunction()

    // should set the game UID
    const lobbyAfter = await lobbyReference.get()
    const gameUID = lobbyAfter.data().gameUID
    expect(gameUID).to.not.be.null

    // should move the players into the game
    const player1 = await db.collection(`games/${gameUID}/players`).doc(player1UID).get()
    const player2 = await db.collection(`games/${gameUID}/players`).doc(player2UID).get()
    expect(player1.exists).to.be.true
    expect(player2.exists).to.be.true

    // should kick only the idle player profile from the lobby
    const player1After = await lobbyPlayersReference.doc(player1UID).get()
    expect(player1After.exists).to.be.true

    const idlePlayerAfter = await lobbyPlayersReference.doc(idlePlayerUID).get()
    expect(idlePlayerAfter.exists).to.be.false
  }).timeout(10000)
})
