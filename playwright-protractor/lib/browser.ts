import {Page} from 'playwright';

export class Browser {
  constructor(private page: Page) { }

  async goto(url: string) {
    return this.page.goto(url);
  }

  async close() {
    return this.page.close();
  }
}