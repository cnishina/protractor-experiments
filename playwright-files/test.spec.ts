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

  beforeAll(async () => {
    const headless = false;
    const playwrightLaunch = await playwright['firefox'].launch({headless});
    const context = await playwrightLaunch.newContext({acceptDownloads: true});
    page = await context.newPage();
  });

  it('should upload and download', async () => {
    await page.goto('https://file.io', {waitUntil: 'networkidle0'});

    // Upload files works!

    // This is one way to do it.
    // The documentation needs to be updated here.
    // page.on('filechooser', async (fileChooser) => {
    //   await fileChooser.element.setInputFiles(filename);
    // });
    // await page.click('input[name="file"]');
    // await new Promise((resolve) => {
    //   setTimeout(resolve, 5000);
    // });

    // This is another way to do it.
    const input = await page.$('input[name="file"]');
    await input.setInputFiles(filename);


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
    const download = await Promise.all([
      page.waitForEvent('download'),
      page.click('span.lead a[target="_blank"]')
    ]);

    console.log(download[0]);
    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });
  });
})