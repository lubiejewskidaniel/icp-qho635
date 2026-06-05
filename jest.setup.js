import '@testing-library/jest-dom';

// jsdom 20 (shipped with jest-environment-jsdom@29) does not implement
// Response or Response.json. Route handlers call Response.json(), so we
// need a minimal polyfill. The guard makes this a no-op in any future
// environment where a real Response already exists.
if (typeof Response === 'undefined' || typeof Response.json !== 'function') {
  class MinimalResponse {
    constructor(body, init) {
      this._body = body;
      this.status = (init && init.status != null) ? init.status : 200;
      this.ok = this.status >= 200 && this.status < 300;
    }

    async json() {
      return JSON.parse(this._body);
    }

    static json(data, init) {
      return new MinimalResponse(JSON.stringify(data), init);
    }
  }

  global.Response = MinimalResponse;
}
