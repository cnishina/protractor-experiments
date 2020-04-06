import {Page} from 'puppeteer';

export interface ElementFactory extends Function {
  (locator: string): Element;
}

export const buildElement = (page: Page, locator: string = null): ElementFactory => {
  let element = (locator: string): Element => {
    return new Element(page, locator);
  };
  return element;
}

export class Element {
  constructor(private page: Page, private locator: string = null) {}

  async click(): Promise<Element> {
    await this.page.click(this.locator);
    return this;
  }
}
