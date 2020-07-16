class Game {
  constructor (
    uid,
    startedAt,
    turnCount,
    alertLevels,
    endedAt
  ) {
    this.uid = uid
    this.startedAt = startedAt
    this.turnCount = turnCount
    this.alertLevels = alertLevels
    this.endedAt = endedAt
  }

  toString () {
    return `Game ${this.uid}`
  }

  static get firestoreConverter () {
    return {
      toFirestore (game) {
        return {
          uid: game.uid,
          startedAt: game.startedAt,
          turnCount: game.turnCount,
          alertLevels: game.alertLevels,
          endedAt: game.endedAt
        }
      },
      fromFirestore (data) {
        return new Game(
          data.uid,
          data.startedAt,
          data.turnCount,
          data.alertLevels,
          data.endedAt
        )
      }
    }
  }
}

module.exports = Game
