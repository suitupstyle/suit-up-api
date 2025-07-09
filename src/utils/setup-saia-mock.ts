import type { AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import queueMock from '../mocks/saia-person-create.json'
import personMock from '../mocks/saia-person.json'

export function setupSaiaMock(http: AxiosInstance) {
    const mock = new MockAdapter(http)

    const routes: Array<[string, string | RegExp, any]> = [
        ['post', '/persons/?measurements_type=all', queueMock],
        ['get', '/queue/4d563d3f-38ae-4b51-8eab-2b78483b153e/', personMock],
        ['get', '/persons/3/', personMock],
    ]

    for (const [method, path, data] of routes) {
        // @ts-ignore
        mock[`on${method.charAt(0).toUpperCase() + method.slice(1)}`](path).reply(200, data)
    }

    return mock
}
