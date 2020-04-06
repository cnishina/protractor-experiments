import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

let page: puppeteer.Page;

describe('', () => {
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });

  beforeAll(async () => {
    const headless = false;
    const width = 1400;
    const height = 600;
    const args = [`--window-size=${width},${height}`];

    const puppeteerLaunch = await puppeteer.launch({headless, args});
    page = await puppeteerLaunch.newPage();
  });

  it('', async () => {
    const client = await page.target().createCDPSession();
    const options = {format : 'png', everyNthFrame: 1};

    try {
      fs.mkdirSync('output');
    } catch (e) {
      // no-op: making output directory unless it already exists.
    }
    
    let frameCount = 0;
    client.on('Page.screencastFrame', async (frame) => {
      console.log(frame.metadata);
      await client.send('Page.screencastFrameAck', {
        sessionId: frame.sessionId});
      const image = path.resolve('output', 'frame' + frameCount + '.png');
      fs.writeFileSync(image, frame.data, 'base64');
      frameCount++;
    });
    
    await page.goto('https://github.com');
    await client.send('Page.startScreencast', options);
    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });

    await page.click('a[href="/open-source"]');
    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });

    await client.send('Page.stopScreencast');
  });
});