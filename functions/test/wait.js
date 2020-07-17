exports.wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

exports.waitForCloudFunction = () => {
  return exports.wait(2000)
}
