import path from 'path'

import { Application } from 'express'
import swaggerJSDoc, { Options } from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import env from '../config/env'

const rootDir = process.cwd()
const routeGlobs =
    env.NODE_ENV === 'production'
        ? [path.join(rootDir, 'dist/modules/**/*.js')]
        : [path.join(rootDir, 'src/modules/**/*.ts')]

const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'SuitUp API',
            version: '1.0.0',
            description: 'Made‑to‑measure suit service',
        },
        servers: [{ url: `${env.API_BASE_URL}/api/${env.API_VERSION}` }],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                },
            },
        },
        security: [{ BearerAuth: [] }],
    },
    apis: [...routeGlobs, path.join(rootDir, 'src/utils/swagger-defs.yaml')],
}

export const swaggerSpec = swaggerJSDoc(swaggerOptions)

export function setupSwagger(app: Application) {
    app.get('/docs/swagger.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
    })

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }))
}
