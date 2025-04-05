import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'

class Note {
    constructor(public data: string[] = ['Moonhalo']) { }
}

const app = new Elysia()
    .use(swagger())
    .decorate('note', new Note())
    .get('/note', ({ note }) => note.data)
    .get(
        '/note/:index',
        ({ note, params: { index }, error }) => {
            return note.data[index] ?? error(404, 'oh no :(')
        },
        {
            params: t.Object({
                index: t.Number()
            })
        }
    )
    .listen(3000)