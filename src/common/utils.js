import NP from 'number-precision'
const isRepeat = (arr = []) => {
  const newArr = Array.from(new Set(arr))
  return arr.length !== newArr.length
}

const handleZero = (values = []) => {
  for (let index = 0; index < values.length; index++) {
    values[index] = values[index] || 0
  }
}
const add = (...args) => {
  handleZero(args)
  const val = NP.plus.apply(null, args)
  return handlePrecision(val)
}

const subtract = (...args) => {
  handleZero(args)
  const val = NP.minus.apply(null, args)
  return handlePrecision(val)
}

const multiply = (...args) => {
  handleZero(args)
  const val = NP.times.apply(null, args)
  return handlePrecision(val)
}

const divide = (...args) => {
  handleZero(args)
  const val = NP.divide.apply(null, args)
  return handlePrecision(val)
}

// 处理小数点位数
const handlePrecision = val => {
  let precision = val.toString().split('.')[1]?.length || 0
  precision > 6 && (precision = 6) // 最多保留6位小数
  return toFixed(val, precision)
}

const toFixed = NP.round

export { add, subtract, multiply, divide, toFixed, isRepeat }
