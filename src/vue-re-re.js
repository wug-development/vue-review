class Dep {
    constructor () {
        this._listener = []
        this.timer = 0
    }

    add (obj) {
        this._listener.push(obj)
    }

    notify () {
        this._listener.forEach(item => {
            if (item.update) {
                clearTimeout(this.timer)
                this.timer = setTimeout(() => {
                    item.update()
                },50)
            }
        })
    }
}
class Watcher {
    constructor (options) {
        this.update = options.update
        Dep.target = this
        let k = options.allVal[options.key]
        Dep.target = null
    }
}
class Vue {
    constructor (options) {
        this.options = options
        this.$data = options.data()

        this.observerRoot(this.$data)
        this.observerData(this.$data)
        this.createFrame()
        this.worker()
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
            Object.defineProperty(obj, item, {
                get: function () {
                    Dep.target && dep.add(Dep.target)
                    console.log(k)
                    return k
                },
                set: function (v) {
                    k = v
                    dep.notify()
                }
            })
        })
    }

    createFrame () {
        this.frame = document.createDocumentFragment()
        this.$el = document.querySelector(this.options.el)
        while(this.$el.firstChild) {
            this.frame.appendChild(this.$el.firstChild)
        }
    }

    worker () {        
        this.come(this.frame)
        this.$el.appendChild(this.frame)
    }

    come (node) {
        Array.from(node.childNodes).forEach(item => {
            this.doSome(item)
            if (item.hasChildNodes()) {
                this.come(item)
            }
        })
    }

    doSome (item) {
        let res = this.getAttrEven(item)
        this.jiexi(item, res)
    }

    getAttrEven(node) {
        let reg_attr = /^v\-\w*$/g
        let reg_event = /^\@\w*/g
        let result = {
            attrs: [],
            events: []
        }
        let _attrs = node.attributes
        _attrs && Array.from(_attrs).forEach(a => {
            if (reg_attr.test(a.name)) {
                result.attrs.push({name: a.name, value: a.value})
            } else if (reg_event.test(a.name)) {
                result.events.push({name: a.name, value: a.value})
            }
        })
        return result
    }

    jiexi (node, res) {
        let that = this
        let _data = this.$data
        res.attrs.forEach(item => {
            let update = () => {
                switch(item.name) {
                    case 'v-model': {
                        node.oninput = function(v) {
                            that.$data[item.value] = node.value
                        }
                        node.value = _data[item.value]
                    }; break;
                    case 'v-html': {
                        node.innerHTML = _data[item.value]
                    }; break;
                }
            }
            update()
            new Watcher({
                allVal: this.$data,
                key: item.value,
                update
            })
        })
        res.events.forEach(item => {
            if (item.name === '@click') {
                node.addEventListener('click', () => {
                    that.options.method[item.value].call(this)
                })
            }
        })
    }
}
