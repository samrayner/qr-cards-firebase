class LobbyPlayer {
  constructor (
    uid,
    joinedAt,
    isReady,
    playedQRCodes = []
  ) {
    this.uid = uid
    this.joinedAt = joinedAt
    this.isReady = isReady
    this.playedQRCodes = playedQRCodes
  }

  toString () {
    return `LobbyPlayer ${this.uid}`
  }

  static get firestoreConverter () {
    return {
      toFirestore (lobbyPlayer) {
        return {
          uid: lobbyPlayer.uid,
          joinedAt: lobbyPlayer.joinedAt,
          isReady: lobbyPlayer.isReady,
          playedQRCodes: lobbyPlayer.playedQRCodes
        }
      },
      fromFirestore (snapshot, options) {
        const data = snapshot.data(options)
        return new LobbyPlayer(
          data.uid,
          data.joinedAt,
          data.isReady,
          data.playedQRCodes
        )
      }
    }
  }
}

module.exports = LobbyPlayer
