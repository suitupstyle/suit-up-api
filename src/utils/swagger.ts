import { Application } from 'express'
import swaggerJSDoc, { Options } from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import env from '../config/env'

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
    // Point to all your route/controller files for JSDoc scanning:
    apis: ['./src/modules/**/*.ts', './src/utils/swagger-defs.yaml'],
}

export const swaggerSpec = swaggerJSDoc(swaggerOptions)

export function setupSwagger(app: Application) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }))
}
