class Lobby {
  constructor (
    code,
    createdAt,
    createdBy,
    gameUID
  ) {
    this.code = code
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
          createdAt: lobby.createdAt,
          createdBy: lobby.createdBy,
          gameUID: lobby.gameUID
        }
      },
      fromFirestore (data) {
        return new Lobby(
          data.code,
          data.createdAt,
          data.createdBy,
          data.gameUID
        )
      }
    }
  }
}

module.exports = Lobby
