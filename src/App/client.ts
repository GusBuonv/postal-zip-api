import fetch, { Response } from "node-fetch";
import { config } from "../Util/config";
import { isZipCodeValid } from "../Util/util";

type ClientOptions = {
  hostname: string,
};

export class Client {
  readonly has = async (zip: string): Promise<boolean> => {
    this.assertValidZip(zip);
    const res = await this.invokeHas(zip);

    if (!res.ok && res.status !== 404) {
      throwForUnhandledResponse(res);
    }

    return res.ok;
  }

  invokeHas(zip: string): Promise<Response> {
    return fetch(`${this.apiRootUrl}/zip-codes/${zip}`, { method: 'HEAD' })
      .catch(throwForFailedFetch);
  }

  async display(): Promise<string> {
    const res = await this.invokeDisplay();

    if (!res.ok) {
      throwForUnhandledResponse(res);
    }

    return res.text();
  }

  invokeDisplay(): Promise<Response> {
    return fetch(`${this.apiRootUrl}/zip-codes`, { method: 'GET' })
      .catch(throwForFailedFetch);
  }

  readonly insert = async (zip: string): Promise<void> => {
    this.assertValidZip(zip);
    const res = await this.invokeInsert(zip);

    if (!res.ok) {
      throwForUnhandledResponse(res);
    }
  }

  invokeInsert(zip: string): Promise<Response> {
    return fetch(`${this.apiRootUrl}/zip-codes/${zip}`, { method: 'PUT' })
      .catch(throwForFailedFetch);
  }

  readonly delete = async (zip: string): Promise<boolean> => {
    this.assertValidZip(zip);
    const res = await this.invokeDelete(zip);

    if (!res.ok && res.status !== 404) {
      throwForUnhandledResponse(res);
    }

    return res.ok;
  }

  invokeDelete(zip: string): Promise<Response> {
    return fetch(`${this.apiRootUrl}/zip-codes/${zip}`, { method: 'DELETE' })
      .catch(throwForFailedFetch);
  }

  constructor(options: ClientOptions) {
    this.apiRootUrl = options.hostname + config.apiPathPrefix;
  }

  private assertValidZip(zip: string): void {
    if (typeof zip !== 'string') {
      throw new TypeError('Expected arg "zip" to be a string');
    }

    if (!isZipCodeValid(zip)) {
      throw new Error('Invalid zip code');
    }
  }

  private apiRootUrl: string;
}

function throwForUnhandledResponse(res: Response): never {
  throw new Error(`Server responded with error: ${res.status} - ${res.statusText}`);
}

function throwForFailedFetch(reason: unknown): never {
  console.error('HTTP request failed on fetch');
  throw reason;
}
