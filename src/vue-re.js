class Dep {
    constructor () {
        this._lister = []
    }

    add (obj) {
        this._lister.push(obj)
    }

    notify () {
        this._lister.forEach(item => {
            item.update && item.update()
        })
    }
}

class Watcher {
    constructor (options) {
        this.update = options.update
        Dep.target = this
        console.log('Watcher start',options.allVal[options.key])
        let m = options.allVal[options.key]
        console.log('Watcher end')
        Dep.target = null
    }
}

class Vue {
    constructor (options) {
        this.$options = options
        this.$data = options.data()
        this.observerRoot(this.$data)
        this.observerData(this.$data)
        this.createFrag()
        this.jiexi()
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
        if (typeof obj !== 'object') return false
        Object.keys(obj).forEach(item => {
            let val = obj[item]
            if (typeof val === 'object') {
                this.observerData(val)
            } else {
                let dep = new Dep()
                Object.defineProperty(obj, item, {
                    get: function () {
                        console.log('get')
                        Dep.target && dep.add(Dep.target)
                        return val
                    },
                    set: function (v) {
                        console.log('set')
                        val = v
                        dep.notify()
                    }
                })
            }
        })
    }

    // 创建虚拟dom
    createFrag () {
        this.$el = document.querySelector(this.$options.el)
        this.$fream = document.createDocumentFragment()
        while(this.$el.firstChild) {
            this.$fream.appendChild(this.$el.firstChild)
        }
    }

    jiexi () {
        this.diguijiexi(this.$fream)
        this.$el.appendChild(this.$fream)
    }

    diguijiexi (ele) {
        Array.from(ele.childNodes).forEach(item => {
            this.comp(item)
            if (item.childNodes) this.diguijiexi(item)
        })
    }

    comp (node) {
        let op = this.getAttrEvents(node)
        this.resolveNode(node, op)
    }

    getAttrEvents (node) {
        let reg_attr = /^v\-\w*/g
        let reg_event = /^\@\w*/g
        let res = {
            attrs: [],
            events: []
        }
        let _attrs = node.attributes
        _attrs && Array.from(_attrs).forEach(item => {
            if (reg_attr.test(item.name)) {
                res.attrs.push({ name: item.name, value: item.value })
            } else if (reg_event.test(item.name)) {
                res.events.push({ name: item.name, value: item.value })
            }
        })
        return res
    }

    resolveNode (node, ops) {
        let _this = this
        let data = this.$data
        ops.attrs.forEach(item => {
            let update = () => {
                console.log('update')
                switch(item.name) {
                    case 'v-model': 
                        node.oninput = (v) => {
                            _this[item.value] = node.value || ''
                        }
                        node.value = data[item.value]
                    ; break;
                    case 'v-html': node.innerHTML = data[item.value]; break;
                    default: break;
                }
                console.log(item.name, node, data[item.value])
            }
            update()

            new Watcher({
                allVal: data,
                key: item.value,
                update
            })
        })
        ops.events.forEach(item => {
            switch(item.name) {
                case '@click': node.addEventListener('click', () => {
                    _this.$options.method[item.value].call(this)
                })
            }
        })
    }
}

var app = new Vue({
    el: '#app',
    data () {
        return {
            name: 'wg'
        }
    },
    method: {
        changeName (v) {
            console.log(123)
            this.name = '儿时的路'
        }
    }
})