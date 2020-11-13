var o = {a: 1, b: 2}
Object.keys(o).forEach(item => {
    let n = o[item]
    Object.defineProperty(this, item, {
        get: function() { console.log(n); return n + 'a' },
        set: function(v) { n = v + 1 }
    })
})
