class Player {
  constructor (
    uid,
    location,
    score,
    playedQRCodes = []
  ) {
    this.uid = uid
    this.location = location
    this.score = score
    this.playedQRCodes = playedQRCodes
  }

  toString () {
    return `Player ${this.uid}`
  }

  static get firestoreConverter () {
    return {
      toFirestore (player) {
        return {
          uid: player.uid,
          location: player.location,
          score: player.score,
          playedQRCodes: player.playedQRCodes
        }
      },
      fromFirestore (snapshot, options) {
        const data = snapshot.data(options)
        return new Player(
          data.uid,
          data.location,
          data.score,
          data.playedQRCodes
        )
      }
    }
  }
}

module.exports = Player
