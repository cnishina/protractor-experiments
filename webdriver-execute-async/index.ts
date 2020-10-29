import { Builder, Session, WebDriver } from 'selenium-webdriver';
import { Executor, HttpClient } from 'selenium-webdriver/http';

async function startSession(
    seleniumAddress: string, capabilities: any): Promise<string> {
  const builder = new Builder()
      .usingServer(seleniumAddress)
      .withCapabilities(capabilities);
  const driver = await builder.build();
  const session = await driver.getSession();
  return session.getId();
}

function getDriver(seleniumAddress: string,
    seleniumSessionId: string): WebDriver {
  const httpClient = new HttpClient(seleniumAddress);
  const executor = new Executor(httpClient);
  const session = new Session(seleniumSessionId, null);
  return new WebDriver(session, executor);
}

async function script(text: string) {
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
    const ret = await driver.executeAsyncScript(script, 'world');
    console.log(ret);
  } catch(e) {
    console.log(e);
  }
  
  
  await driver.close();
}

test();