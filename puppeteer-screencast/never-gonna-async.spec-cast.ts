import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

let page: puppeteer.Page;

describe('never gonna give you up', () => {
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 140000;
  });

  beforeAll(async () => {
    const headless = false;
    const width = 1200;
    const height = 800;
    const args = [`--window-size=${width},${height}`];

    const puppeteerLaunch = await puppeteer.launch({headless, args,
      defaultViewport: {width, height}});
    page = await puppeteerLaunch.newPage();
  });

  it('should get video frames?', async () => {
    const client = await page.target().createCDPSession();
    const options = {format : 'png', everyNthFrame: 1};
    let promises: Promise<any>[] = [];

    try {
      fs.mkdirSync('output-async');
    } catch (e) {
      // no-op: making output directory unless it already exists.
    }
    
    let frameCount = 0;
    client.on('Page.screencastFrame', async (frame) => {
      await client.send('Page.screencastFrameAck', {
        sessionId: frame.sessionId});
      const image = path.resolve('output-async', 'frame' + frameCount + '.png');
      promises.push(new Promise((resolve) => {
        fs.writeFile(image, frame.data, 'base64', resolve);
      }));
      frameCount++;
    });
    
    await page.goto('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
    await page.click(
      'div[id="primary-inner"] div[id="player"].ytd-watch-flexy');
    await client.send('Page.startScreencast', options);
    await new Promise((resolve) => {
      setTimeout(resolve, 100000);
    });
    await client.send('Page.stopScreencast');
    await Promise.all(promises);
  });
});