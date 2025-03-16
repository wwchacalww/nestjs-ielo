export function calculatePercentageDifference(a: number, b: number) {
  if (b === 0) return 0
  if (a === 0) return -100
  if (a < b) {
    const percentageDifference = ((a - b) / b) * 100
    const diff = (percentageDifference + 100) * -1

    return diff.toFixed(2) + '%'
  }
  if (a > b) {
    const percentageDifference = ((a - b) / b) * 100
    const diff = percentageDifference - 100
    return diff.toFixed(2) + '%'
  }
}
