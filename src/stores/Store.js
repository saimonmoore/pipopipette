import { decorate, observable } from "mobx"

class Store {
  grid_size = 5

  setGridSize(newSize) {
    this.grid_size = newSize
  }
}

decorate(Store, {
  grid_size: observable,
})

export default Store
