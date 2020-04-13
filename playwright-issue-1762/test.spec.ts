import * as playwright from 'playwright';

let page: playwright.Page = null;

describe('', () => {
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });

  beforeAll(async () => {
    const playwrightLaunch = await playwright['chromium'].launch({
      headless: false, slowMo: 50 });
    const context = await playwrightLaunch.newContext();
    page = await context.newPage();
  });

  it('should work', async () => {
    console.log('goto');
    await page.goto(
      'https://journal.cnishina.dev/2020/04/create-mp4-from-screencast.html');
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    console.log('click journal');
    await page.click('a[href="https://journal.cnishina.dev/"]');
    console.log('youtube');
    await page.click('a[href="https://youtu.be/dQw4w9WgXcQ"]');
  });
});