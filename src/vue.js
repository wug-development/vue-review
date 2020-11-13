// 双向
class Dep {
    constructor () {
        this._listeners = []
    }

    add (obj) {
        this._listeners.push(obj)
    }

    notify () {
        this._listeners.forEach(item => item.update && item.update())
    }
}

class Watcher {
    constructor (options) {
        this.update = options.update
        Dep.target = this
        this.val = options.allVal[options.key]
        Dep.target = null
    }
}

class Vue {
    constructor (options) {
        this.$options = options
        // 获取所有data属性
        this.$data = options.data()
        // 劫持data属性到根节点（Vue） this.name
        this.observerRoot()
        // 劫持data属性 递归所有属性 设置get set属性
        this.observerData(this.$data)
        // 创建虚拟dom
        this.createFragment()
        // 编译解析虚拟dom
        this.compile()
    }

    observerRoot () {
        Object.keys(this.$data).forEach(item => {
            console.log(this)
            Object.defineProperty(this, item, {
                get: function () {
                    return this.$data[item]
                },
                set: function (newVal) {
                    this.$data[item] = newVal
                }
            })
        })
    }

    // 劫持$data
    observerData (obj) {
        if (!obj || typeof obj != 'object') return
        Object.keys(obj).forEach(item => {
            let val = obj[item]
            if (typeof val === 'object') {
                this.observerData(obj[item])
            } else {
                let dep = new Dep()
                Object.defineProperty(obj, item, {
                    get: function () {
                        Dep.target && dep.add(Dep.target)
                        return val
                    },
                    set: function (newVal) {
                        val = newVal
                        dep.notify()
                    }
                })
            }
        })
    }

    // 创建虚拟dom
    createFragment () {
        this.$el = document.querySelector(this.$options.el)
        this.$fragment = document.createDocumentFragment()
        while (this.$el.firstChild) {
            this.$fragment.appendChild(this.$el.firstChild)
        }
    }

    // 编译
    compile () {
        // 解析
        this._compileElement(this.$fragment)
        // 重新append到根元素下
        this.$el.appendChild(this.$fragment)
    }

    // 递归解析所有虚拟dom
    _compileElement (ele) {
        Array.from(ele.childNodes).forEach(node => {
            this._compileNode(node)
            if (node.childNodes) this._compileElement(node)
        })
    }

    // 解析节点
    _compileNode (node) {
        // 1. 解析节点包含的指令、事件...
        let res = this._checkHasBind(node)
        // 2. 处理解析结果
        this._resolveBind(node, res)
    }

    // 解析节点包含的指令、事件
    _checkHasBind (node) {
        let attributes = node.attributes
        let dir_reg = /^v\-\w*$/
        let event_reg = /^\@\w*/
        let result = {
            directives: [], //指令
            events: [] //事件
        }

        if (attributes) Array.from(attributes).forEach(item => {
            if (dir_reg.test(item.name)) {
                result.directives.push({ name:item.name, value: item.value })
            } 
            if (event_reg.test(item.name)) {
                result.events.push({ name:item.name, value: item.value })
            }
        })

        return result
    }

    // 处理解析结果
    _resolveBind(node, res) {
        let _this = this
        let data = this.$data
        let { directives, events } = res
        directives.length && directives.forEach(item => {
            let update = () => {
                switch (item.name) {
                    case 'v-model': 
                        node.oninput = (val) => {
                            _this[item.value] = node.value || ''
                        }
                        node.value = data[item.value]
                        break;
                    case 'v-html':
                        node.innerHTML = data[item.value]
                        break;
                    default: break;
                }
            }

            update()

            let watch_option = {
                allVal: data,
                key: item.value,
                directive: item.name,
                node: node,
                update
            }
            new Watcher(watch_option)
        })

        events.length && events.forEach(item => {
            let method_name = item.value
            let target_event = item.name.slice(1, item.name.length)

            console.log(item.name)
            node.addEventListener(target_event, () => {
                console.log(method_name)
                this.$options.methods[method_name].call(this)
            })
        })
    }
}

let app = new Vue({
    el: '#app',
    data() {
        return {
            name: '二傻子'
        }
    },
    methods: {
        changeName () {
            this.name = Math.floor(Math.random() * 10)
        }
    }
})