/**代理实现类**/
class ProxyCopy {
    constructor (target, handle) {
        this.targetCopy = this.clone(target)
        this.proxyTarget(target, handle)
    }

    clone (myobj) {
        if (typeof myobj !== 'object' || myobj === null) return myobj
        let newObj = new Object();
        for (let i in myobj) {
            if (myobj.hasOwnProperty(i)) {
                newObj[i] = this.clone(myobj[i])
            }
        }
        return newObj
    }

    proxyTarget (target, handle) {
        Object.keys(this.targetCopy).forEach(item => {
            Object.defineProperty(this.targetCopy, item, {
                get: function () {
                    return handle.get && handle.get(target, item)
                },
                set: function (newVal) {
                    handle.set && handle.set(target, item, newVal)
                }
            })
        })
    }
}

let person = {name:''};
let personCopy = new ProxyCopy(person,{
    get(target,key){
        console.log('get方法被拦截。。。 实现原理为通过属性的getter驱动函数调用该方法');
        return target[key];
    },
    set(target,key,value){
        console.log('set方法被拦截。。。实现原理为通过属性的setter驱动函数调用该方法');
        target[key]=value+"www";
    }
});
personCopy.targetCopy.name = 'arvin';  // set方法被拦截。。。
console.log(personCopy.targetCopy.name);