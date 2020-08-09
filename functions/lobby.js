const functions = require('firebase-functions')
const admin = require('./admin')
const { Lobby, LobbyPlayer } = require('./models')
const { HttpsError } = require('firebase-functions/lib/providers/https')

const generateCode = (length, attempt) => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const charactersLength = characters.length
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const createDocument = async (
  userUID,
  playerCount,
  generator = generateCode,
  attempt = 1
) => {
  if (attempt > 5) {
    throw new HttpsError('already-exists', 'Exceeded lobby code generation attempts (5)')
  }

  const code = generator(4, attempt)

  const lobbyReference = admin.getFirestore()
    .collection('lobbies')
    .withConverter(Lobby.firestoreConverter)
    .doc(code)

  try {
    await lobbyReference.create(
      new Lobby(
        code,
        playerCount,
        new Date(),
        userUID,
        null
      )
    )
  } catch (error) {
    return await createDocument(userUID, playerCount, generator, attempt + 1)
  }

  return {
    code: code,
    reference: lobbyReference
  }
}

exports.createDocument = createDocument

exports.create = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    if (!context.auth) {
      throw new HttpsError('permission-denied', 'Not authorized')
    }

    const userUID = context.auth.uid
    const playerCount = JSON.parse(data).playerCount
    const lobbyDocument = await createDocument(userUID, playerCount)

    await lobbyDocument
      .reference
      .collection('players')
      .withConverter(LobbyPlayer.firestoreConverter)
      .doc(userUID)
      .set(
        new LobbyPlayer(
          userUID,
          new Date()
        )
      )

    return lobbyDocument.code
  })

exports.join = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    if (!context.auth) {
      throw new HttpsError('permission-denied', 'Not authorized')
    }

    const userUID = context.auth.uid
    const lobbyCode = JSON.parse(data).code

    const lobbyReference = admin.getFirestore()
      .collection('lobbies')
      .withConverter(Lobby.firestoreConverter)
      .doc(lobbyCode)

    const lobby = await lobbyReference.get()

    if (!lobby.exists) {
      throw new HttpsError('not-found', 'Lobby not found.')
    }

    const lobbyData = lobby.data()
    if (lobbyData && lobbyData.gameUID) {
      throw new HttpsError('deadline-exceeded', 'Game has started.')
    }

    await lobbyReference
      .collection('players')
      .withConverter(LobbyPlayer.firestoreConverter)
      .doc(userUID)
      .set(
        new LobbyPlayer(
          userUID,
          new Date()
        )
      )
  })

exports.leave = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    if (!context.auth) {
      throw new HttpsError('permission-denied', 'Not authorized')
    }

    const userUID = context.auth.uid
    const lobbyCode = JSON.parse(data).code

    const lobbyReference = admin.getFirestore()
      .collection('lobbies')
      .doc(lobbyCode)

    const lobby = await lobbyReference.get()

    if (!lobby.exists) {
      throw new HttpsError('not-found', 'Lobby not found.')
    }

    await lobbyReference
      .collection('players')
      .doc(userUID)
      .delete()
  })
