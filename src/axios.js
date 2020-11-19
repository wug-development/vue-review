class Axios {
    constructor () {
        this.params = {
            baseUrl: '',
            method: 'GET',
            url: '',
            async: true,
            dataType: 'text',
            data: null,
            headers: {},
            timeout: 20000
        }
    }

    create (options) {
        Object.assign(this.params, options)
    }

    get (url, data) {
        this.params.method = 'GET'
        this.params.url = url
        this.params.data = data || {}
        return this.request()
    }

    post (url, data) {
        this.params.method = 'POST'
        this.params.url = url
        this.params.data = data || {}
        return this.request()
    }

    request () {
        let xhr = new XMLHttpRequest()
        return new Promise((resolve, reject) => {
            xhr.open(this.params.method, this.params.url, this.params.async);
            xhr.timeout = this.params.timeout
            for (let key in this.params.headers) {
                xhr.setRequestHeader(key, this.params.headers[key])
            }
            xhr.responseType = this.params.dataType
            xhr.onloadend = function () {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    resolve(xhr)
                } else {
                    reject({
                        errorType: 'status_error',
                        xhr
                    })
                }
            }
            try{
                xhr.send(this.params.data)
            } catch (e) {
                reject({
                    errorType: 'send_error',
                    error: e
                })
            }
        })
    }
}