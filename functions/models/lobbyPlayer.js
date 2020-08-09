class LobbyPlayer {
  constructor (
    uid,
    joinedAt,
    color = null
  ) {
    this.uid = uid
    this.joinedAt = joinedAt
    this.color = color
  }

  toString () {
    return `LobbyPlayer ${this.uid}`
  }

  get isReady () {
    return this.color != null
  }

  static get firestoreConverter () {
    return {
      toFirestore (lobbyPlayer) {
        return {
          uid: lobbyPlayer.uid,
          joinedAt: lobbyPlayer.joinedAt,
          color: lobbyPlayer.color
        }
      },
      fromFirestore (snapshot, options) {
        const data = snapshot.data(options)
        return new LobbyPlayer(
          data.uid,
          data.joinedAt,
          data.color
        )
      }
    }
  }
}

module.exports = LobbyPlayer
