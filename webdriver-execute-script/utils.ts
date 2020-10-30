import { Builder, Session, WebDriver } from 'selenium-webdriver';
import { Executor, HttpClient } from 'selenium-webdriver/http';

export async function startSession(
    seleniumAddress: string, capabilities: any): Promise<string> {
  const builder = new Builder()
      .usingServer(seleniumAddress)
      .withCapabilities(capabilities);
  const driver = await builder.build();
  const session = await driver.getSession();
  return session.getId();
}

export function getDriver(seleniumAddress: string,
    seleniumSessionId: string): WebDriver {
  const httpClient = new HttpClient(seleniumAddress);
  const executor = new Executor(httpClient);
  const session = new Session(seleniumSessionId, null);
  return new WebDriver(session, executor);
}