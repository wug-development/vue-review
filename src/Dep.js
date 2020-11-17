class Dep {
    constructor () {
        this._listener = []
    }

    add (obj) {
        this._listener.push(obj)
    }

    notify () {
        this._listener.forEach(item => {
            item.update && item.update()
        })
    }
}
export default Dep