class Lobby {
  constructor (
    code,
    playerCount,
    createdAt,
    creatorUID,
    gameUID
  ) {
    this.code = code
    this.playerCount = playerCount
    this.createdAt = createdAt
    this.creatorUID = creatorUID
    this.gameUID = gameUID
  }

  toString () {
    return `Lobby ${this.code}`
  }

  static get firestoreConverter () {
    return {
      toFirestore (lobby) {
        return {
          code: lobby.code,
          playerCount: lobby.playerCount,
          createdAt: lobby.createdAt,
          creatorUID: lobby.creatorUID,
          gameUID: lobby.gameUID
        }
      },
      fromFirestore (snapshot, options) {
        const data = snapshot.data(options)
        return new Lobby(
          data.code,
          data.playerCount,
          data.createdAt,
          data.creatorUID,
          data.gameUID
        )
      }
    }
  }
}

module.exports = Lobby
