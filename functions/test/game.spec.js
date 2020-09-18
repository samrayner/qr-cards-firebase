const { expect } = require('chai')
const test = require('firebase-functions-test')({
  projectId: process.env.GCLOUD_PROJECT
})

const { LobbyPlayer, Lobby } = require('../models')
const { HttpsError } = require('firebase-functions/lib/providers/https')

const admin = require('../admin')
admin.init()

const app = require('../index')
const db = admin.getFirestore()
const user = test.auth.exampleUserRecord()
const auth = { auth: { uid: user.uid } }

const lobbyReference = db
  .collection('lobbies')
  .withConverter(Lobby.firestoreConverter)
  .doc('AAAA')

const lobbyPlayersReference = lobbyReference
  .collection('players')
  .withConverter(LobbyPlayer.firestoreConverter)

describe('Game creation', () => {
  after(test.cleanup)

  describe('when unauthenticated', () => {
    it('should fail with an error', async () => {
      try {
        await test.wrap(app.game.create)('{ "lobbyCode": "invalid" }', null)
        expect.fail()
      } catch (error) {
        expect(error.toString()).to.eql(
          (new HttpsError('permission-denied', 'Not authorized')).toString()
        )
      }
    })
  })

  describe('when the lobby does not exist', () => {
    it('should fail with an error', async () => {
      try {
        await test.wrap(app.game.create)('{ "lobbyCode": "invalid" }', auth)
        expect.fail()
      } catch (error) {
        expect(error.toString()).to.eql(
          (new HttpsError('not-found', 'Lobby not found.')).toString()
        )
      }
    })
  })

  describe('when the lobby exists', () => {
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
            new Date(),
            1
          )
        )

      await lobbyPlayersReference
        .doc(player2UID)
        .create(
          new LobbyPlayer(
            player2UID,
            new Date(),
            2
          )
        )

      await test.wrap(app.game.create)('{ "lobbyCode": "AAAA" }', auth)

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
    })
  })
})
