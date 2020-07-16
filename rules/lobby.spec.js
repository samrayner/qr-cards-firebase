const firebase = require('@firebase/testing')
const helpers = require('./test-helpers')

before(helpers.loadRules)
beforeEach(helpers.clearFirestore)
after(helpers.deleteApps)

const LOBBIES = 'lobbies'
const PLAYER_PROFILES = 'playerProfiles'
const LOBBY_CODE = 'ABCD'
const USER_UID = helpers.generateUID()

describe('Lobby creation', () => {
  describe('when unauthenticated', () => {
    const db = helpers.getAuthedFirestore(null)

    it('should fail', async () => {
      const doc = db.collection(LOBBIES).doc(LOBBY_CODE)
      await firebase.assertFails(doc.set({ code: LOBBY_CODE }))
    })
  })

  describe('when authenticated', () => {
    const db = helpers.getAuthedFirestore({ uid: USER_UID })

    it('should succeed', async () => {
      const doc = db.collection(LOBBIES).doc(LOBBY_CODE)
      await firebase.assertSucceeds(doc.set({ code: LOBBY_CODE }))
    })
  })
})

describe('Lobby update & deletion', () => {
  const adminDB = helpers.getAdminFirestore()

  describe('when authenticated', () => {
    const db = helpers.getAuthedFirestore({ uid: USER_UID })

    it('succeeds for creator', async () => {
      await adminDB
        .collection(LOBBIES)
        .doc(LOBBY_CODE)
        .set({ createdBy: USER_UID })

      const doc = db.collection(LOBBIES).doc(LOBBY_CODE)
      await firebase.assertSucceeds(doc.update({ hello: 'world' }))
      await firebase.assertSucceeds(doc.delete())
    })

    it('fails for non-creators', async () => {
      await adminDB
        .collection(LOBBIES)
        .doc(LOBBY_CODE)
        .set({ createdBy: helpers.generateUID() })

      const doc = db.collection(LOBBIES).doc(LOBBY_CODE)
      await firebase.assertFails(doc.update({ hello: 'world' }))
      await firebase.assertFails(doc.delete())
    })
  })

  describe('when unauthenticated', () => {
    const db = helpers.getAuthedFirestore(null)

    it('should fail', async () => {
      const doc = db.collection(LOBBIES).doc(LOBBY_CODE)
      await firebase.assertFails(doc.update({ hello: 'world' }))
      await firebase.assertFails(doc.delete())
    })
  })
})

describe('Lobbies read', () => {
  const adminDB = helpers.getAdminFirestore()

  it('fails', async () => {
    await adminDB
      .collection(LOBBIES)
      .doc(LOBBY_CODE)
      .set({ code: LOBBY_CODE })

    const db = helpers.getAuthedFirestore({ uid: USER_UID })
    await firebase.assertFails(db.collection(LOBBIES).get())
  })
})

describe('Lobby read', () => {
  const adminDB = helpers.getAdminFirestore()

  describe('when unauthenticated', () => {
    const db = helpers.getAuthedFirestore(null)

    it('should fail', async () => {
      await adminDB
        .collection(LOBBIES)
        .doc(LOBBY_CODE)
        .set({ code: LOBBY_CODE })

      const doc = db
        .collection(LOBBIES)
        .doc(LOBBY_CODE)

      await firebase.assertFails(doc.get())
    })
  })

  describe('when authenticated', () => {
    const db = helpers.getAuthedFirestore({ uid: USER_UID })

    it('fails if not in lobby', async () => {
      await adminDB
        .collection(LOBBIES)
        .doc(LOBBY_CODE)
        .set({ code: LOBBY_CODE })

      const doc = db
        .collection(LOBBIES)
        .doc(LOBBY_CODE)

      await firebase.assertFails(doc.get())
    })

    it('succeeds if in lobby', async () => {
      await adminDB
        .collection(LOBBIES)
        .doc(LOBBY_CODE)
        .set({ code: LOBBY_CODE })

      await adminDB
        .collection(helpers.path(LOBBIES, LOBBY_CODE, PLAYER_PROFILES))
        .doc(USER_UID)
        .set({ uid: USER_UID })

      const doc = db
        .collection(LOBBIES)
        .doc(LOBBY_CODE)

      await firebase.assertSucceeds(doc.get())
    })
  })
})
