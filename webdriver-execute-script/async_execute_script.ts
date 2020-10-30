import { getDriver, startSession } from './utils';

async function asyncScript(text: string) {
  const callback = arguments[arguments.length - 1];
  await new Promise(resolve => {
    setTimeout(resolve, 5000);
  })
  callback(`hello ${text}`);
}

async function test() {
  const seleniumAddress = 'http://127.0.0.1:4444/wd/hub';
  const capabilities = {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--headless', '--disable-gpu'],
      w3c: false,
    },
  };
  const seleniumSessionId = await startSession(seleniumAddress,  capabilities);
  const driver = getDriver(seleniumAddress, seleniumSessionId);
  try {
    const ret = await driver.executeAsyncScript(asyncScript, 'world');
    console.log(ret);
  } catch(e) {
    console.log(e);
  }
  await driver.close();
}

test();