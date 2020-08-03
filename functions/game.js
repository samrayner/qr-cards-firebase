const functions = require('firebase-functions')

const admin = require('./admin')
admin.init()

const { Lobby, Game, Player, LobbyPlayer } = require('./models')
const { v4: uuid } = require('uuid')

exports.create = functions
  .region('europe-west1')
  .firestore
  .document('/lobbies/{lobbyCode}/players/{playerUID}')
  .onUpdate(async (change, context) => {
    const db = admin.getFirestore()
    const lobbyCode = context.params.lobbyCode

    const lobbyReference = db
      .collection('lobbies')
      .withConverter(Lobby.firestoreConverter)
      .doc(lobbyCode)

    const lobbyPlayersReference = db
      .collection(`lobbies/${lobbyCode}/players`)
      .withConverter(LobbyPlayer.firestoreConverter)

    const lobby = await lobbyReference.get()
    const lobbyPlayers = await lobbyPlayersReference.get()

    let readyPlayerCount = 0

    lobbyPlayers.forEach((lobbyPlayer) => {
      if (lobbyPlayer.data().isReady) {
        readyPlayerCount++
      }
    })

    if (readyPlayerCount < lobby.data().playerCount) { return }

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

    // add the ready players to the game, kick excess
    lobbyPlayers.forEach((lobbyPlayer) => {
      const data = lobbyPlayer.data()

      const playerReference = gameReference
        .collection('players')
        .withConverter(Player.firestoreConverter)
        .doc(data.uid)

      if (data.isReady) {
        batch.set(
          playerReference,
          new Player(
            data.uid,
            { x: 0, y: 0 },
            0
          )
        )
      } else {
        batch.delete(lobbyPlayersReference.doc(data.uid))
      }
    })

    // link the lobby to the created game
    batch.update(
      lobbyReference,
      { gameUID: gameUID }
    )

    await batch.commit()
  })
