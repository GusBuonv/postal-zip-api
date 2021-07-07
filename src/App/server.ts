import * as express from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { makeRouter } from './router';
import { ZipCodesRegistry } from '../Domain/ZipCodesRegistry';

/**
 * Creates and starts a new server for the API at a random port on the local machine
 *
 * @returns The server and related information
 */
export function startServer(): Promise<{ server: Server, address: AddressInfo }> {
  /** Create the App */
  const app = express();
  const registry = new ZipCodesRegistry(); // MAIN DEPENDENCY - business logic implemented on class
  const router = makeRouter(registry); // app level interface to business logic
  app.use(router);

  /** Create & Start Server */
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line prefer-const
    let server: Server;

    const handleError = () => {
      server.close();
      reject(new Error('HTTP server encountered an error on startup'));
    };

    server = app.listen(() => {
      server.removeListener('error', handleError);
      const address = server.address();
      if (!address || typeof address !== 'object') {
        server.close();
        reject(new TypeError('HTTP server of unexpected type'));
      } else {
        if (process.env.CLI) {
          console.log(`API is live and listening at: http://localhost:${address.port}`);
        }
        resolve({ server, address });
      }
    });
    server.addListener('error', handleError);
  })
}
