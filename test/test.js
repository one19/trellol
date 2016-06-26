const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('chromedriver').path;
const assert = require('assert');
const test = require('selenium-webdriver/testing');
const app = require('../web');

const service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);
const makeWebDriver = () => {
  const driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();
  return driver;
};

test.describe('Trellol HTML', () => {
  test.it('Should load on default port.', () => {
    const driver = makeWebDriver();
    driver.get('http://localhost:3002');
    const loadButton = driver.findElement(webdriver.By.id('getGist'));
    loadButton.getAttribute('innerHTML').then((name) => {
      assert.equal(name, 'RELOAD DATA');
    });
    driver.quit();
  });
  test.it('Should display the standard top bar.', () => {
    const driver = makeWebDriver();
    driver.get('http://localhost:3002');
    const topNav = driver.findElement(webdriver.By.className('topBar'));
    topNav.getAttribute('outerHTML').then((allHTML) => {
      assert.equal(allHTML,
  `<div class="topBar" style="-webkit-filter: blur(0px);">
    <div class="logo" id="logo">
      <div class="logo">Trel</div><div class="logoB">l.l</div>
    </div>
    <h2 class="button main clicked" id="getGist">RELOAD DATA</h2>
    <div class="alert" id="alert"></div>
    <div class="store" id="store"></div>
    <div class="total" id="total">TOTAL CARDS: NaN</div>
  <h2 class="button main" id="noignore">HIDE IGNORED</h2></div>`
      );
    });
    driver.quit();
  });
});
