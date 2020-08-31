const firebase = require('@firebase/testing')
const helpers = require('./test-helpers')

before(helpers.loadRules)
beforeEach(helpers.clearFirestore)
after(helpers.deleteApps)

const GAMES = 'games'
const PLAYERS = 'players'
const GAME_UID = helpers.generateUID()
const USER_UID = helpers.generateUID()

describe('Games read', () => {
  const adminDB = helpers.getAdminFirestore()

  it('fails', async () => {
    await adminDB
      .collection(GAMES)
      .doc(GAME_UID)
      .set({ uid: GAME_UID })

    const db = helpers.getAuthedFirestore({ uid: USER_UID })
    await firebase.assertFails(db.collection(GAMES).get())
  })
})

describe('Game read', () => {
  const adminDB = helpers.getAdminFirestore()

  describe('when unauthenticated', () => {
    const db = helpers.getAuthedFirestore(null)

    it('should fail', async () => {
      await adminDB
        .collection(GAMES)
        .doc(GAME_UID)
        .set({ uid: GAME_UID })

      const doc = db
        .collection(GAMES)
        .doc(GAME_UID)

      await firebase.assertFails(doc.get())
    })
  })

  describe('when authenticated', () => {
    const db = helpers.getAuthedFirestore({ uid: USER_UID })

    it('fails if not in game', async () => {
      await adminDB
        .collection(GAMES)
        .doc(GAME_UID)
        .set({ uid: GAME_UID })

      const doc = db
        .collection(GAMES)
        .doc(GAME_UID)

      await firebase.assertFails(doc.get())
    })

    it('succeeds if in game', async () => {
      await adminDB
        .collection(GAMES)
        .doc(GAME_UID)
        .set({ uid: GAME_UID })

      await adminDB
        .collection(helpers.path(GAMES, GAME_UID, PLAYERS))
        .doc(USER_UID)
        .set({ uid: USER_UID })

      const doc = db
        .collection(GAMES)
        .doc(GAME_UID)

      await firebase.assertSucceeds(doc.get())
    })
  })
})

describe('Game update', () => {
  const adminDB = helpers.getAdminFirestore()

  describe('when unauthenticated', () => {
    const db = helpers.getAuthedFirestore(null)

    it('should fail', async () => {
      await adminDB
        .collection(GAMES)
        .doc(GAME_UID)
        .set({ uid: GAME_UID, turnCount: 0 })

      const doc = db
        .collection(GAMES)
        .doc(GAME_UID)

      await firebase.assertFails(doc.set({ uid: GAME_UID, turnCount: 1 }))
    })
  })

  describe('when authenticated', () => {
    const db = helpers.getAuthedFirestore({ uid: USER_UID })

    it('fails if not in game', async () => {
      await adminDB
        .collection(GAMES)
        .doc(GAME_UID)
        .set({ uid: GAME_UID, turnCount: 0 })

      const doc = db
        .collection(GAMES)
        .doc(GAME_UID)

      await firebase.assertFails(doc.set({ uid: GAME_UID, turnCount: 1 }))
    })

    it('succeeds if in game', async () => {
      await adminDB
        .collection(GAMES)
        .doc(GAME_UID)
        .set({ uid: GAME_UID, turnCount: 0 })

      await adminDB
        .collection(helpers.path(GAMES, GAME_UID, PLAYERS))
        .doc(USER_UID)
        .set({ uid: USER_UID })

      const doc = db
        .collection(GAMES)
        .doc(GAME_UID)

      await firebase.assertSucceeds(doc.set({ uid: GAME_UID, turnCount: 1 }))
    })
  })
})
