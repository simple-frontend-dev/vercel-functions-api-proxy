# How to secure a private API key with Vercel Edge Functions

## Learn how to use Vercel Functions to secure a private API key to call a third party API from a browser client.

Demo repository of article on [simple frontend](https://www.simplefrontend.dev/guides/how-to-secure-api-key-with-vercel-edge-functions/)

### Securing a client side API key

You have developed a UI widget that makes its own API call, such as a web component, or you want to integrate your static website with a third-party API. Both of them gave you a private API key that you were told to keep safe. The problem is that you may not have a backend server, and no amount of work on your client-side code like obsfucation will help you: as soon as your client code is loaded by your end user's browser, your API key is exposed and subject to theft.

This is an old problem with many solutions, one simple solution is to send your API call to a server you own and have the server proxy the request to the third party API with your API key attached. This way, your API key stays secure on the server to handle the communication and is never exposed to the end user. In this guide I will show you how to do this in a few minutes using [Vercel Edge Functions](https://vercel.com/docs/functions).

### Vercel Functions

Vercel Functions enable you to run compute on-demand, among many other things, for example to run a proxy server call to keep your API key private. In this example we will be using the [Edge Runtime](https://vercel.com/docs/functions/runtimes/edge-runtime) for our Vercel Functions as they are cost-effective and execute in the data center closest to the end user.

Vercel Functions using the Edge Runtime use a limited set of Web Standard APIs that are more than enough for proxying API calls.

### Setting it up the proxy

I will be extending [Vercel Functions Quickstart](https://vercel.com/docs/functions/quickstart) to focus on the Edge Runtime and how to securely proxy an API call.

Create a new directory and use your favorite package manager to stat a new project, in this guide I will be using [pnpm](https://pnpm.io/).

```bash
pnpm init
```

Install the following devDependencies: **vercel**, **@vercel/edge** and **typescript**:

```bash
pnpm install --save-dev vercel @vercel/edge typescript
```

In this simple example we will not be using @vercel/edge, however this package is quicky useful so I recommend installing it from the start.

Add [Vercel Edge Runtime tsconfig.json](https://github.com/vercel/edge-runtime/blob/main/tsconfig.json)

tsconfig.json:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "declaration": true,
    "esModuleInterop": true,
    "inlineSources": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "target": "ES2019",
    "types": ["node", "jest"],
    "stripInternal": true
  }
}
```

Create a new file named **proxy.ts** under an **api** directory, **./api/proxy.ts** with the following content:

```javascript
const API_ENDPOINT = "A_THIRD_PARTY_API_ENDPOINT";
const PRIVATE_API_KEY = "A_VERY_PRIVATE_API_KEY";
const requestUrl = `${API_ENDPOINT}?key=${PRIVATE_API_KEY}`;

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  try {
    const response = await fetch(requestUrl);
    const data = await response.json();
    // post process data if necessary
    return Response.json(data, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error(error);
  }
}
```

### Deploy to Vercel

For example using the [Vercel CLI](https://vercel.com/docs/cli/deploying-from-cli) and your Vercel setup and defaults

```bash
pnpm exec vercel
```

Then you should be able to access your API endpoint at the URI given, for me it was **https://demo-vercel-functions-api-proxy.vercel.app/api/proxy** using

```bash
pnpm exec vercel --prod
```

### Handling Cross-Origin Resource Sharing (CORS)

In most cases, you might be able to run your proxy server on the same domain as your website but when it is not the case you will have to handle CORS and you might be wondering how to setup CORS for Vercel Edge Functions. Fortunately Vercel makes it easy to handle CORS using a [verce.json](https://vercel.com/guides/how-to-enable-cors#enabling-cors-using%C2%A0vercel.json) config file:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
        }
      ]
    }
  ]
}
```

Bonus point: you can even restrict the usage of your new API endpoint to your website domain only by entering it in the value field of **Access-Control-Allow-Origin**.

That's it! Thanks to Vercel Edge Functions, you have a secure proxy to safely keep your API key private and call your third party APIs.
