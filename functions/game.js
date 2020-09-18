const functions = require('firebase-functions')

const admin = require('./admin')
admin.init()

const { Lobby, Game, Player, LobbyPlayer } = require('./models')
const { HttpsError } = require('firebase-functions/lib/providers/https')
const { v4: uuid } = require('uuid')

exports.create = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    if (!context.auth) {
      throw new HttpsError('permission-denied', 'Not authorized')
    }

    const db = admin.getFirestore()
    const lobbyCode = JSON.parse(data).lobbyCode

    const lobbyReference = admin.getFirestore()
      .collection('lobbies')
      .withConverter(Lobby.firestoreConverter)
      .doc(lobbyCode)

    const lobbyPlayersReference = db
      .collection(`lobbies/${lobbyCode}/players`)
      .withConverter(LobbyPlayer.firestoreConverter)

    const lobby = await lobbyReference.get()
    const lobbyPlayers = await lobbyPlayersReference.get()

    if (!lobby.exists) {
      throw new HttpsError('not-found', 'Lobby not found.')
    }

    const readyPlayerUIDs = []

    lobbyPlayers.forEach((lobbyPlayer) => {
      const data = lobbyPlayer.data()
      if (data.isReady) {
        readyPlayerUIDs.push(data.uid)
      }
    })

    shuffle(readyPlayerUIDs)

    if (readyPlayerUIDs.length < lobby.data().playerCount) { return }

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
          readyPlayerUIDs
        )
      )
    } catch (error) {
      console.log(error)
      return
    }

    const batch = db.batch()

    const boardWidth = 9
    const boardHeight = 5
    const startLocations = [
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: boardWidth - 2, y: 0 },
      { x: boardWidth - 1, y: 1 },
      { x: 0, y: boardHeight - 2 },
      { x: 1, y: boardHeight - 1 },
      { x: boardWidth - 1, y: boardHeight - 2 },
      { x: boardWidth - 2, y: boardHeight - 1 }
    ]
    shuffle(startLocations)
    let startLocationIndex = 0

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
            data.color,
            startLocations[startLocationIndex]
          )
        )
        startLocationIndex++
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

const shuffle = (array) => {
  let counter = array.length

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter)
    counter--
    const temp = array[counter]
    array[counter] = array[index]
    array[index] = temp
  }

  return array
}
