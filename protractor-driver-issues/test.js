describe('', () => {
  it('should', async () => {
    await browser.get('https://arctan.dev');
    const button = element(by.css('button.button-example-1'));
    const numberOfClicks = element(by.css('span#button-example-value'));
    expect(await numberOfClicks.getText()).toBe('0');
    await button.click();
    expect(await numberOfClicks.getText()).toBe('1');
  });
});