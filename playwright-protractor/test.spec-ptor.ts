import * as playwright from 'playwright';
import {Browser} from './lib/browser';
import {By} from './lib/by';
import {buildElement, ElementFactory} from './lib/element';

let browser: Browser;
let by: By;
let element: ElementFactory;

describe('', () => {
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });

  beforeAll(async () => {
    const playwrightLaunch = await playwright['chromium'].launch({
      headless: false, slowMo: 50 });
    const context = await playwrightLaunch.newContext();
    const page = await context.newPage();
    browser = new Browser(page);
    by = new By();
    element = buildElement(page);
  });

  it('should launch a browser', async () => {
    await browser.goto('https://github.com');
    await element(by.css('a[href="/open-source"]')).click();
    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
    await browser.close();
  });
});