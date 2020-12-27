import fetch from 'node-fetch';
import { OAuth } from 'oauth';
import * as qs from 'query-string';

type Options = {
  /**
   * API Version
   *
   * @see https://developer.twitter.com/en/docs/twitter-api/v1
   * @see https://developer.twitter.com/en/docs/twitter-api/early-access
   */
  api_version: '1.1' | '2' | '';

  /** @see https://developer.twitter.com/en/docs/authentication/oauth-1-0a */
  consumer_key: string | null;

  /** @see https://developer.twitter.com/en/docs/authentication/oauth-1-0a */
  consumer_secret: string | null;

  /** @see https://developer.twitter.com/en/docs/authentication/oauth-1-0a */
  access_token_key: string | null;

  /** @see https://developer.twitter.com/en/docs/authentication/oauth-1-0a */
  access_token_secret: string | null;

  /** @see https://developer.twitter.com/en/docs/authentication/oauth-2-0 */
  bearer_token: string | null;

  /** Request Headers */
  headers: {
    [key: string]: string;
  };
};

class Twitter {
  options: Options = {
    api_version: '1.1',
    consumer_key: null,
    consumer_secret: null,
    access_token_key: null,
    access_token_secret: null,
    bearer_token: null,
    headers: {},
  };

  constructor(options: Partial<Options>) {
    this.options = {
      ...this.options,
      ...options,
      headers: {
        ...this.options.headers,
        ...options.headers,
      },
    };
  }

  /**
   * Build URL
   *
   * @param path path
   */
  private buildUrl(path: string): string {
    if (!this.options.api_version || path.match(/^https?:\/\//)) {
      return path;
    }

    path = path.replace(/^\//, '');

    switch (this.options.api_version) {
      case '2': {
        return `https://api.twitter.com/2/${path}`;
      }
      case '1.1':
      default: {
        path = path.replace(/\.json$/, '');
        return `https://api.twitter.com/1.1/${path}.json`;
      }
    }
  }

  /**
   * Build Headers
   *
   * Use Bearer Token when it exists. Then use oauth.
   *
   * @param url URL
   * @param method method
   */
  private buildHeaders(url: string, method = 'get'): { [key: string]: string } {
    if (this.options.bearer_token) {
      return {
        ...this.options.headers,
        authorization: 'Bearer ' + this.options.bearer_token,
      };
    }

    const oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      this.options.consumer_key || '',
      this.options.consumer_secret || '',
      '1.0A',
      null,
      'HMAC-SHA1'
    );
    return {
      ...this.options.headers,
      authorization: oauth.authHeader(
        url,
        this.options.access_token_key || '',
        this.options.access_token_secret || '',
        method
      ),
    };
  }

  /**
   * GET Requset
   *
   * @param path path
   * @param params params (query)
   */
  public async get(path: string, params: any): Promise<any> {
    try {
      const url = qs.stringifyUrl({
        url: this.buildUrl(path),
        query: params,
      });

      const response = await fetch(url, {
        headers: this.buildHeaders('get', url),
      });

      if (!response.ok) {
        const text = await response.text();
        let result = '';
        try {
          result = JSON.parse(text);
        } catch (e) {
          result = text;
        }
        throw result;
      }

      const json = await response.json();
      return Promise.resolve(json);
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

export default Twitter;
