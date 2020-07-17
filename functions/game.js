const functions = require('firebase-functions')

const admin = require('./admin')
admin.init()

const { Game, Player, PlayerRole, PlayerProfile } = require('./models')
const { v4: uuid } = require('uuid')

exports.create = functions
  .region('europe-west1')
  .firestore
  .document('/lobbies/{lobbyCode}/playerProfiles/{playerUID}')
  .onUpdate(async (change, context) => {
    const db = admin.getFirestore()
    const lobbyCode = context.params.lobbyCode

    const playerProfilesReference = db
      .collection(`lobbies/${lobbyCode}/playerProfiles`)
      .withConverter(PlayerProfile.firestoreConverter)

    const readyPlayersWithRole = await playerProfilesReference
      .where('role', 'in', [PlayerRole.THIEF, PlayerRole.DETECTIVE])
      .where('isReady', '==', true)
      .get()

    if (readyPlayersWithRole.size !== 2) { return }

    const gameUID = uuid()

    const gameReference = db
      .collection('games')
      .withConverter(Game.firestoreConverter)
      .doc(gameUID)

    // create the game
    try {
      await gameReference.create(
        new Game(
          gameUID,
          new Date(),
          0,
          {},
          null
        )
      )
    } catch (error) {
      console.log(error)
      return
    }

    const batch = db.batch()

    const gamePlayerUIDs = []

    // add the ready players to the game
    readyPlayersWithRole.forEach((playerProfile) => {
      const profile = playerProfile.data()

      gamePlayerUIDs.push(profile.uid)

      const playerReference = gameReference
        .collection('players')
        .withConverter(Player.firestoreConverter)
        .doc(profile.uid)

      batch.set(
        playerReference,
        new Player(
          profile.uid,
          profile.role,
          profile.role === PlayerRole.THIEF ? 0 : 1,
          0,
          0
        )
      )
    })

    const allProfiles = await playerProfilesReference.get()

    // remove all excess players from lobby
    allProfiles
      .forEach((playerProfile) => {
        const profile = playerProfile.data()

        if (gamePlayerUIDs.includes(profile.uid)) { return }

        batch.delete(playerProfilesReference.doc(profile.uid))
      })

    // link the lobby to the created game
    const lobbyReference = db
      .collection('lobbies')
      .doc(lobbyCode)

    await batch.update(
      lobbyReference,
      { gameUID: gameUID }
    )

    await batch.commit()
  })
