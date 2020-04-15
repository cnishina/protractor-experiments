import * as playwright from 'playwright';
import { Visual } from './lib/visual';

let page: playwright.Page;
let visual: Visual;

describe('visual testing', () => {
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 140000;
  });

  beforeAll(async () => {
    const headless = true;
    const playwrightLaunch = await playwright['chromium'].launch({headless});
    const context = await playwrightLaunch.newContext();
    page = await context.newPage();
    visual = new Visual('an example test', page, 'chromium');
  });

  it('should screenshot and screencast to create a video', async () => {
    const youtubeVideo = 'div[id="primary-inner"] ' +
      'div[id="player"].ytd-watch-flexy';

    // screencast #1: play, sleep 5 seconds, pause.
    await visual.startScreencast();
    await page.goto('https://youtu.be/dQw4w9WgXcQ',
      {waitUntil: 'networkidle2'});
    await new Promise((resolve) => {setTimeout(resolve, 1000);});
    await page.click(youtubeVideo);
    await new Promise((resolve) => {setTimeout(resolve, 5000);});
    await page.click(youtubeVideo);
    await new Promise((resolve) => {setTimeout(resolve, 1000);});
    await visual.stopScreencast();

    // screenshots #1.
    await new Promise((resolve) => {setTimeout(resolve, 1000);});
    await visual.screenshot();
    await new Promise((resolve) => {setTimeout(resolve, 1000);});
    await visual.screenshot();

    // screencast #2: play sleep, 5 seconds, pause.
    await visual.startScreencast();
    await page.click(youtubeVideo);
    await new Promise((resolve) => {setTimeout(resolve, 5000);});
    await page.click(youtubeVideo);
    await new Promise((resolve) => {setTimeout(resolve, 1000);});
    await visual.stopScreencast();
    
    // screenshots #2.
    await new Promise((resolve) => {setTimeout(resolve, 1000);});
    await visual.screenshot();
    await new Promise((resolve) => {setTimeout(resolve, 1000);});
    await visual.screenshot();

    // finish up.
    await page.close();
    await visual.createVideo();
  });
});