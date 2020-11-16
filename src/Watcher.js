class Watcher {
    constructor (options) {
        this.update = options.update
        Dep.target = this
        let k = options.allVal[options.key]
        // Dep.target = null
    }
}