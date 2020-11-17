import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('US1234 When a User navigates to the homepage', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('TIX-1234 they should see Justin on the main message', () => {
    page.navigateTo();
    expect(page.getTitleText()).toContain('Justin');
  });

  it('TIX-1235 they should see Mamie on the main message', () => {
    page.navigateTo();
    expect(page.getTitleText()).toContain('Mamie');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
