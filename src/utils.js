export function range(size) {
  return Array.apply(null, {length: size}).map(Number.call, Number)
}

