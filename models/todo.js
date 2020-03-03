const Model = require('./main')

class Todo extends Model {
    constructor(form={}, userId=-1) {
        super(form)
        this.task = form.task || ''
        // 和别的数据的关联的方式, 用 userId 表明拥有它的 user 实例
        this.userId = 'userId' in form ? form.userId : userId
    }

    static add(form, userId) {
        form.userId = userId
        Todo.create(form)
    }

    static update(form) {
        // todo 放进 model
        const todoId = Number(form.id)
        const t = this.get(todoId)
        const validNames = [
            'task',
        ]
        Object.keys(form).forEach(k => {
            if (validNames.includes(k)) {
                t[k] = form[k]
            }
        })
        t.save()
    }
}

module.exports = Todo
