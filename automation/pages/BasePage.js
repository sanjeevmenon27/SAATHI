/**
 * SaathiCare E2E — Base Page Object
 */
const { By, until } = require("selenium-webdriver");
const config = require("../config/config");

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.timeout = config.TIMEOUT;
  }

  async navigate(path) {
    await this.driver.get(`${config.BASE_URL}${path}`);
    await this.driver.sleep(500);
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async waitForElement(locator, timeout) {
    return await this.driver.wait(until.elementLocated(locator), timeout || this.timeout);
  }

  async waitForVisible(locator, timeout) {
    const el = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementIsVisible(el), timeout || this.timeout);
    return el;
  }

  async click(locator) {
    const el = await this.waitForVisible(locator);
    await el.click();
  }

  async type(locator, text) {
    const el = await this.waitForVisible(locator);
    await el.clear();
    await el.sendKeys(text);
  }

  async getText(locator) {
    const el = await this.waitForVisible(locator);
    return await el.getText();
  }

  async getAttribute(locator, attr) {
    const el = await this.waitForElement(locator);
    return await el.getAttribute(attr);
  }

  async isDisplayed(locator) {
    try {
      const el = await this.driver.findElement(locator);
      return await el.isDisplayed();
    } catch { return false; }
  }

  async isEnabled(locator) {
    try {
      const el = await this.driver.findElement(locator);
      return await el.isEnabled();
    } catch { return false; }
  }

  async elementExists(locator) {
    try {
      await this.driver.findElement(locator);
      return true;
    } catch { return false; }
  }

  async getElementCount(locator) {
    const elements = await this.driver.findElements(locator);
    return elements.length;
  }

  async getPageSource() {
    return await this.driver.getPageSource();
  }

  async executeScript(script, ...args) {
    return await this.driver.executeScript(script, ...args);
  }

  async scrollToBottom() {
    await this.executeScript("window.scrollTo(0, document.body.scrollHeight)");
  }

  async scrollToTop() {
    await this.executeScript("window.scrollTo(0, 0)");
  }

  async getViewportWidth() {
    return await this.executeScript("return window.innerWidth");
  }

  async getViewportHeight() {
    return await this.executeScript("return window.innerHeight");
  }

  async waitForUrlContains(text, timeout) {
    await this.driver.wait(until.urlContains(text), timeout || this.timeout);
  }

  async getConsoleErrors() {
    try {
      const logs = await this.driver.manage().logs().get("browser");
      return logs.filter(l => l.level.name === "SEVERE").map(l => l.message);
    } catch { return []; }
  }
}

module.exports = { BasePage };
