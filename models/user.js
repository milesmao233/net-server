const Model = require('./main')
const Todo = require('./todo')
const crypto = require('crypto')

class User extends Model {
    constructor(form={}) {
        super(form)
        // User 类定义两个属性
        this.username = form.username || ''
        this.password = form.password || ''
    }

    static create(form={}) {
        form.password = this.saltedPassword(form.password)
        // 调用父类的 create 方法
        const u = super.create(form)
        return u
    }

    static saltedPassword(password, salt='sd3SDFU(*IJ)') {
        const salted = password + salt
        const hash = crypto.createHash('sha256')
        hash.update(salted)
        const h = hash.digest('hex')
        return h
    }

    // 校验登录的逻辑
    static validateLogin(form) {
        const {username, password} = form
        const u = this.findBy('username', username)
        return u !== null && u.password === this.saltedPassword(password)
    }

    // 校验注册的逻辑
    static validateRegister(form) {
        const {username, password} = form
        const validUsername = username.length > 2
        const validPassword = password.length > 2
        const uniqueUsername = User.findBy('username', username) === null
        const valid = validUsername && validPassword && uniqueUsername
        if (valid) {
            const u = this.create(form)
            return u
        } else {
            return null
        }
    }

    static guest() {
        const o = {
            id: -1,
            username: '游客',
        }
        const u = this.create(o)
        return u
    }

    static update(form) {
        const userId = Number(form.id)
        const u = this.get(userId)
        const validNames = [
            'password',
        ]
        Object.keys(form).forEach(k => {
            if (validNames.includes(k)) {
                u[k] = form[k]
            }
        })
        u.save()
    }


    todos() {
        const todos = Todo.all()
        const ts = todos.filter(t => t.userId === this.id)
        return ts
    }
}

module.exports = User
