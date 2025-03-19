export function calculatePercentageDifference(a: number, b: number) {
  if (b === 0) return 0
  if (a === 0) return -100
  const percentageDifference = ((a - b) / b) * 100
  console.log(percentageDifference)
  return percentageDifference.toFixed(2) + '%'
}
