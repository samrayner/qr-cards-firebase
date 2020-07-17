const { expect } = require('chai')
const admin = require('firebase-admin')
const test = require('firebase-functions-test')({
  projectId: process.env.GCLOUD_PROJECT
})
const app = require('../index')
const { Lobby } = require('../models')
const { HttpsError } = require('firebase-functions/lib/providers/https')

const db = admin.firestore()
const user = test.auth.exampleUserRecord()
const auth = { auth: { uid: user.uid } }

describe('Lobby creation', () => {
  after(test.cleanup)

  describe('when unauthenticated', () => {
    it('should fail with an error', async () => {
      try {
        await test.wrap(app.lobby.create)(null, null)
        expect.fail()
      } catch (error) {
        expect(error.toString()).to.eql(
          (new HttpsError('permission-denied', 'Not authorized')).toString()
        )
      }
    })
  })

  describe('when no lobbies exist', () => {
    it('should create a new lobby with a unique code and the user as a player', async () => {
      const lobbyCode = await test.wrap(app.lobby.create)(null, auth)

      const lobbyRef = db.collection('lobbies').doc(lobbyCode)
      const lobby = await lobbyRef.get()
      const profile = await lobbyRef.collection('playerProfiles').doc(user.uid).get()

      expect(lobby.data().code).to.eql(lobbyCode)
      expect(lobby.data().createdBy).to.eql(user.uid)
      expect(profile.data().uid).to.eql(user.uid)
    })
  })

  describe('when the first lobby code exists', () => {
    const codeGenerator = (length, attempt) => {
      return attempt === 1 ? 'AAAA' : 'BBBB'
    }

    before(async () => {
      await db
        .collection('lobbies')
        .withConverter(Lobby.firestoreConverter)
        .doc('AAAA')
        .set(
          new Lobby(
            'AAAA',
            new Date(),
            'creatorUID',
            null
          )
        )
    })

    it('should create a new lobby with a unique code', async () => {
      const lobbyDocument = await app.lobby.createDocument(user.uid, codeGenerator)
      expect(lobbyDocument.code).to.eql('BBBB')
      const lobby = await lobbyDocument.reference.get()
      expect(lobby.exists)
    })
  })

  describe('when the first 5 lobby codes exist', () => {
    const codeGenerator = (length, attempt) => {
      return 'CCCC'
    }

    before(async () => {
      await db
        .collection('lobbies')
        .withConverter(Lobby.firestoreConverter)
        .doc('CCCC')
        .set(
          new Lobby(
            'CCCC',
            new Date(),
            'creatorUID',
            null
          )
        )
    })

    it('should fail with an error', async () => {
      try {
        await app.lobby.createDocument(user.uid, codeGenerator)
        expect.fail()
      } catch (error) {
        expect(error.toString()).to.eql(
          (new HttpsError('already-exists', 'Exceeded lobby code generation attempts (5)')).toString()
        )
      }
    })
  })
})

describe('Joining a lobby', () => {
  describe('when unauthenticated', () => {
    it('should fail with an error', async () => {
      try {
        await test.wrap(app.lobby.join)('{ "code": "invalid" }', null)
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
        await test.wrap(app.lobby.join)('{ "code": "invalid" }', auth)
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
      await db
        .collection('lobbies')
        .withConverter(Lobby.firestoreConverter)
        .doc('ZZZZ')
        .set(
          new Lobby(
            'ZZZZ',
            new Date(),
            'creatorUID',
            null
          )
        )
    })

    it('adds the authenticated user as a player to the lobby', async () => {
      const lobbyRef = db.collection('lobbies').doc('ZZZZ')
      await lobbyRef.update({ gameUID: null })
      await test.wrap(app.lobby.join)('{ "code": "ZZZZ" }', auth)
      const player = await lobbyRef.collection('playerProfiles').doc(user.uid).get()
      expect(player.exists)
    })

    it('fails if the game has started', async () => {
      const lobbyRef = db.collection('lobbies').doc('ZZZZ')
      await lobbyRef.update({ gameUID: 'abc123' })
      try {
        await test.wrap(app.lobby.join)('{ "code": "ZZZZ" }', auth)
        expect.fail()
      } catch (error) {
        expect(error.toString()).to.eql(
          (new HttpsError('deadline-exceeded', 'Game has started.')).toString()
        )
      }
    })
  })
})
