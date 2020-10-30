import { getDriver, startSession } from './utils';

async function script(text: string) {
  await new Promise(resolve => {
    setTimeout(resolve, 5000);
  })
  return `hello ${text}`;
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
    const ret = await driver.executeScript(script, 'world');
    console.log(ret);
  } catch(e) {
    console.log(e);
  }
  await driver.close();
}

test();