const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('chromedriver').path;
const assert = require('assert');
const test = require('selenium-webdriver/testing');
const app = require('../web');

const service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);
const driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();

test.describe('Google Search', () => {
  test.it('should work', () => {
    driver.get('http://www.google.com');
    const searchBox = driver.findElement(webdriver.By.name('q'));
    searchBox.sendKeys('simple programmer');
    searchBox.getAttribute('value').then((value) => {
      assert.equal(value, 'simple programmer');
    });
    driver.quit();
  });
});


test.describe('Trellol', () => {
  test.it('Should load on default port.', () => {
    const web = app();
    driver.get('https://localhost:3002');
    const searchBox = driver.findElement(webdriver.By.name('q'));
    searchBox.sendKeys('simple programmer');
    searchBox.getAttribute('value').then((value) => {
      assert.equal(value, 'simple programmer');
    });
    driver.quit();
  });
});
