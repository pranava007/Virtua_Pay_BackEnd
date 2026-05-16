import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VirtuaPay API Documentation',
      version: '1.0.0',
      description: `
        API documentation for VirtuaPay Merchants and Integrations.
        
        ### Authentication
        All Merchant APIs require an API Key. 
        1. Get your API Key from the **VirtuaPay Dashboard** under Settings.
        2. Include it in your request headers as: \`x-api-key: YOUR_KEY_HERE\`
        
        Example Header:
        \`\`\`
        x-api-key: vp_live_xxxxxxxxxxxx
        \`\`\`
      `,
    },
    servers: [
      {
        url: 'http://localhost:7000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
