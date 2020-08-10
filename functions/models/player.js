class Player {
  constructor (
    uid,
    color,
    location,
    score = 0,
    playedQRCodes = []
  ) {
    this.uid = uid
    this.color = color
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
          color: player.color,
          location: player.location,
          score: player.score,
          playedQRCodes: player.playedQRCodes
        }
      },
      fromFirestore (snapshot, options) {
        const data = snapshot.data(options)
        return new Player(
          data.uid,
          data.color,
          data.location,
          data.score,
          data.playedQRCodes
        )
      }
    }
  }
}

module.exports = Player
