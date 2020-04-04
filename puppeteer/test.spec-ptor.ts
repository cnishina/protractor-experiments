import * as puppeteer from 'puppeteer';
import {Browser} from './lib/browser';
import {By} from './lib/by';
import {ElementFactory, buildElement} from './lib/element';

const headless = false;
const width = 1400;
const height = 600;
const args = [`--window-size=${width},${height}`];
let page: puppeteer.Page = null;

// the protractor-ish interface.
let browser: Browser;
let element: ElementFactory;
let by: By;

describe('Protractor-ish interfaces using Puppeteer', () => {
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });

  beforeAll(async () => {
    const puppeteerLaunch = await puppeteer.launch({headless, args});
    page = await puppeteerLaunch.newPage();

    browser = new Browser(page);
    by = new By();
    element = buildElement(page);
  })

  it('should launch a browser', async () => {
    await browser.goto('https://google.com');

    // This is the css class for the "Stay home. Saves lives." campaign
    // on the Google homepage.
    await element(by.css('.NKcBbd')).click();

    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
    await browser.close();
  });
});

