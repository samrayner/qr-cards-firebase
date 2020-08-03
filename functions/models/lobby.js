class Lobby {
  constructor (
    code,
    playerCount,
    createdAt,
    createdBy,
    gameUID
  ) {
    this.code = code
    this.playerCount = playerCount
    this.createdAt = createdAt
    this.createdBy = createdBy
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
          createdBy: lobby.createdBy,
          gameUID: lobby.gameUID
        }
      },
      fromFirestore (snapshot, options) {
        const data = snapshot.data(options)
        return new Lobby(
          data.code,
          data.playerCount,
          data.createdAt,
          data.createdBy,
          data.gameUID
        )
      }
    }
  }
}

module.exports = Lobby
