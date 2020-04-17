import * as fs from 'fs';
import * as path from 'path';
import * as playwright from 'playwright';
import { Protocol } from 'playwright-core/types/protocol';

export class Network {
  name: string;
  chromeDevTools: playwright.CDPSession;
  baseFolder: string = 'output';
  startTime: number = Number.MAX_SAFE_INTEGER;
  endTime: number = Number.MIN_SAFE_INTEGER;
  requestPayloads: Protocol.Network.requestWillBeSentPayload[] = [];
  responsePayloads: Protocol.Network.responseReceivedPayload[] = [];

  constructor(name: string, private page: playwright.Page,
      private browserName: string) {
    this.name = name.replace('/', '_').replace(' ', '_');
    try {
      this.baseFolder = path.join(this.baseFolder, this.name);
      fs.mkdirSync(this.baseFolder,  {recursive: true});
    } catch (e) {
      // no-op: we just want an output directory.
    }
  }

  async start() {
    if (this.browserName === 'chromium') {
      const chromiumContext = (
        this.page.context() as playwright.ChromiumBrowserContext);
      this.chromeDevTools = await chromiumContext.newCDPSession(this.page);
      await this.chromeDevTools.send('Network.enable');

      try {
        this.chromeDevTools.on('Network.requestWillBeSent',
            (payload: Protocol.Network.requestWillBeSentPayload) => {
          this.startTime = Math.min(payload.timestamp, this.startTime);
          this.endTime = Math.max(payload.timestamp, this.endTime);
          this.requestPayloads.push(payload);
          console.log(`${payload.timestamp} -> ${payload.request.method} ${payload.request.url}`);
        });
        this.chromeDevTools.on('Network.responseReceived',
            (payload: Protocol.Network.responseReceivedPayload) => {
          this.startTime = Math.min(payload.timestamp, this.startTime);
          this.endTime = Math.max(payload.timestamp, this.endTime);
          this.responsePayloads.push(payload);
          console.log(`${payload.timestamp} <- ${payload.response.status} ${payload.response.url}`);
        })
      } catch (e) {
        console.log('something bad happened here');
      }
    }
  }

  async stop() {
    if (this.browserName === 'chromium') {
      await this.chromeDevTools.send('Network.disable');
    }
    const fdRequest = fs.openSync(path.resolve(this.baseFolder,
      `network_request_${this.startTime.toFixed(6)}_` +
      `${this.endTime.toFixed(6)}.txt`), 'w');
    const fdResponse = fs.openSync(path.resolve(this.baseFolder,
      `network_response_${this.startTime.toFixed(6)}_` +
      `${this.endTime.toFixed(6)}.txt`), 'w');
    for (const requestPayload of this.requestPayloads) {
      fs.writeSync(fdRequest, `${JSON.stringify(requestPayload)}\n`);
    }
    for (const responsePayload of this.requestPayloads) {
      fs.writeSync(fdResponse, `${JSON.stringify(responsePayload)}\n`);
    }
    fs.closeSync(fdRequest);
    fs.closeSync(fdResponse);
  }

}