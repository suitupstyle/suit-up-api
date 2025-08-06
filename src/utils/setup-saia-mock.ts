import type { AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import queueMock from '../mocks/saia-person-create.json'
import personMock from '../mocks/saia-person.json'

export function setupSaiaMock(http: AxiosInstance) {
    const mock = new MockAdapter(http)

    mock.onPost('/persons/').reply(200, queueMock)

    mock.onGet(new RegExp('^/queue/[0-9a-fA-F\\-]+/$')).reply(200, personMock)

    mock.onGet(new RegExp('^/persons/[^/]+/$')).reply(200, personMock)

    return mock
}
