import * as fs from 'fs';
import * as path from 'path';
import * as playwright from 'playwright';

let page: playwright.Page;
let filename = path.resolve(__dirname, 'hello.zzz');

describe('download testing', () => {
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 140000;
    fs.writeFileSync(filename, 'hello world');
  });

  it('should upload and download', async () => {
    const headless = false;
    const playwrightLaunch = await playwright['chromium'].launch({headless});
    const context = await playwrightLaunch.newContext({acceptDownloads: true});
    page = await context.newPage();
    await page.goto('https://file.io', {waitUntil: 'networkidle'});

    // Upload files.

    // 1. Playwright documentation shows to do it this way.
    // page.on('filechooser', async ({element, multiple}) => {
    //   await element.setInputFiles(filename);
    // });
    // await page.click('input[name="file"]');

    // 2. Another way to upload a file.
    // https://github.com/microsoft/playwright/blob/master/docs/examples/README.md#file-uploads
    const input = await page.$('input[name="file"]');
    await input.setInputFiles(filename);

    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
    // Download not working.
    //     Failures:
    // 1) network testing should upload and download
    //   Message:
    //     TimeoutError: Timeout exceeded while waiting for download
    //   Stack:
    //         at <Jasmine>
    //         at Timeout.setTimeout (/Users/craignishina/src/protractor-experiments/playwright-files/node_modules/playwright-core/lib/helper.js:139:28)
    //         at ontimeout (timers.js:436:11)
    //         at tryOnTimeout (timers.js:300:5)
    //         at listOnTimeout (timers.js:263:5)
    //         at Timer.processTimers (timers.js:223:10)
    // let [ download1 ] = await Promise.all([
    //   page.waitForEvent('download'),
    //   page.click('span.lead a[target="_blank"]')
    // ]);
    // console.log(await download1.path());

    page.close();

    page = await context.newPage();
    page.goto('https://github.com/microsoft/playwright/releases', {waitUntil: 'networkidle'});

    // Download a file.

    let [ download2 ] = await Promise.all([
      page.waitForEvent('download'),
      page.click('a[href="/microsoft/playwright/archive/v0.15.0.zip"]')
    ]);

    console.log(await download2.path());
    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });
  });
})