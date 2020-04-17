import * as playwright from 'playwright';
import { Network } from './lib/network';

let page: playwright.Page;
let network: Network;

describe('network testing', () => {
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 140000;
  });

  beforeAll(async () => {
    const headless = true;
    const playwrightLaunch = await playwright['chromium'].launch({headless});
    const context = await playwrightLaunch.newContext();
    page = await context.newPage();
    network = new Network('an example test', page, 'chromium');
  });

  it('should get request and responses', async () => {

    await network.start();
    await page.goto('https://youtube.com', {waitUntil: 'networkidle2'});
    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
    await network.stop();
  });
})