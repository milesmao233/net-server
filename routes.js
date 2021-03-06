const fs = require('fs')
const {log, template} = require('./utils')

const User = require('./models/user')
const Session = require('./models/session')

const randomString = () => {
    const seed = 'asdfghjokpwefdsui3456789dfghjk67wsdcfvgbnmkcvb2e'
    let s = ''
    for (let i = 0; i < 16; i++) {
        const random = Math.random() * seed.length
        const index = Math.floor(random)
        s += seed[index]
    }
    return s
}
//
// // 读取 html 文件的函数
// // 这样我们可以把页面的内容写入到 html 文件中, 专注处理逻辑
// const template = (name) => {
//     const path = 'templates/' + name
//     const options = {
//         encoding: 'utf8'
//     }
//     const content = fs.readFileSync(path, options)
//     return content
// }

const currentUser = (request) => {
    const s = request.cookies.session
    if (s !== undefined) {
        // log('debug s in current user', s)
        const r = Session.decrypt(s)
        const u = User.get(r.uid)
        if (u !== null) {
            return u
        } else {
            return User.guest()
        }
    } else {
        return User.guest()
    }
}

const loginRequired = (func) => {
    const f = (request) => {
        const u = currentUser(request)
        if (u.id === User.guest().id) {
            // 没有登录
            return redirect('/')
        } else {
            return func(request)
        }
    }
    return f
}

const headerFromMapper = (mapper={}, code=200) => {
    let header = `HTTP/1.1 ${code} Gua\r\nContent-Type: text/html\r\n`
    const s = Object.keys(mapper).map(k => `${k}: ${mapper[k]}\r\n`).join('')
    header = header + s
    return header
}

const routeIndex = (request) => {
    const u = currentUser(request)
    log('user', u)
    const body = template('index.html', {
        username: u.username
    })
    return htmlResponse(body)
}

// 静态资源的响应函数, 读取图片并生成响应返回
const routeStatic = (request) => {
    // 静态资源的处理, 读取图片并生成相应返回
    const filename = request.query.file || 'doge.gif'
    const path = `static/${filename}`
    const body = fs.readFileSync(path)
    const header = headerFromMapper()

    const h = Buffer.from(header + '\r\n')
    const r = Buffer.concat([h, body])
    return r
}

const error = (code=404) => {
    const e = {
        404: 'HTTP/1.1 404 NOT FOUND\r\n\r\n<h1>NOT FOUND</h1>',
    }
    const r = e[code] || ''
    return r
}

const redirect = (url, headers={}) => {
    // 浏览器在收到 302 响应的时候
    // 会自动在 HTTP header 里面找 Location 字段并获取一个 url
    // 然后自动请求新的 url
    const h = {
        'Location': url,
    }
    Object.assign(headers, h)
    // 增加 Location 字段并生成 HTTP 响应返回
    const r = headerFromMapper(headers, 302) + '\r\n' + ''
    return r
}

const htmlResponse = (body, headers={}) => {
    const header = headerFromMapper(headers)
    const r = header + '\r\n' + body
    return r
}

const routeMapper = () => {
    const d = {
        '/': routeIndex,
        '/static': routeStatic,
    }
    return d
}

module.exports = {
    routeMapper, routeMapper,
    error: error,
    template: template,
    headerFromMapper: headerFromMapper,
    redirect: redirect,
    currentUser: currentUser,
    loginRequired: loginRequired,
    randomString: randomString,
    htmlResponse: htmlResponse,
}
