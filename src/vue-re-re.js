import Dep from './Dep'
import Watcher from './Watcher'

class Vue {
    constructor (options) {
        this.$el = options.el
        this.$data = options.data()
        this.observerRoot(this.$data)
        this.observerData(this.$data)
        this.createFrame()
    }

    observerRoot (obj) {
        Object.keys(obj).forEach(item => {
            Object.defineProperty(this, item, {
                get: function () {
                    return this.$data[item]
                },
                set: function (v) {
                    this.$data[item] = v
                }
            })
        })
    }

    observerData (obj) {
        Object.keys(obj).forEach(item => {
            let k = obj[item]
            let dep = new Dep()
            Object.defineProperty(this, item, {
                get: function () {
                    Dep.target && dep.add(Dep.target)
                    return k
                },
                set: function (v) {
                    dep.notify()
                    k = v
                }
            })
        })
    }

    createFrame () {
        this.f = document.createDocumentFragment()
        let _html = document.querySelector(this.$el)
        while(_html.childNode) {
            this.f.appendChild(_html.childNode)
        }
        this.come(this.f)
    }

    come (node) {
        let attrs = []
        let events = []
        let that = this
        node.childNodes.forEach(item => {
            if (item.hasChildNodes()) {
                this.come(item)
            } else {
                Array.from(item.attributes).forEach(a => {
                    switch (a) {
                        case 'v-model': {
                            item.oninput = function (n) {
                                that.$data[a.value] = n
                            }
                        }; break;
                        case 'v-html': {
                            item.innerHTML = that.$data[a.value]
                        }; break;
                        default: break;
                    }
                })
            }
        })
    }
}

let app = new Vue({
    el: '#app',
    data () {
        return {
            name: 'w'
        }
    },
    method: {
        changeName (v) {
            this.name = v
        }
    }
})