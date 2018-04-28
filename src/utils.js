export function range(size) {
  return Array.apply(null, {length: size}).map(Number.call, Number)
}

export function to(promise) {
   return promise.then(data => {
      return [null, data];
   })
   .catch(err => [err]);
}
