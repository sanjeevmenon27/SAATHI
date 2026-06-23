/**
 * SaathiCare E2E — Landing Page Object
 */
const { By } = require("selenium-webdriver");
const { BasePage } = require("./BasePage");

class LandingPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.selectors = {
      navbar: By.css("nav, header, [role='banner']"),
      logo: By.xpath("//a[contains(@class, 'text-2xl')] | //a[contains(@class, 'logo')] | //header//a[1]"),
      loginLink: By.xpath("//a[contains(@href, '/login')] | //button[contains(text(), 'Login')] | //a[contains(text(), 'Login')]"),
      registerLink: By.xpath("//a[contains(@href, '/register')] | //button[contains(text(), 'Register')] | //a[contains(text(), 'Sign')]"),
      heroSection: By.xpath("//section[1] | //main//div[1]"),
      heroHeading: By.css("h1, h2"),
      ctaButton: By.xpath("//a[contains(@class, 'btn')] | //button[contains(@class, 'btn')] | //a[contains(@class, 'bg-')]"),
      footer: By.css("footer, [role='contentinfo']"),
      mainContent: By.css("main, #root > div"),
      body: By.tagName("body"),
      allLinks: By.tagName("a"),
      allButtons: By.tagName("button"),
      allImages: By.tagName("img"),
      allHeadings: By.xpath("//h1 | //h2 | //h3"),
    };
  }

  async open() { await this.navigate("/"); }
  async isNavbarVisible() { return await this.isDisplayed(this.selectors.navbar); }
  async isLogoVisible() { return await this.isDisplayed(this.selectors.logo); }
  async clickLogin() { await this.click(this.selectors.loginLink); }
  async clickRegister() { await this.click(this.selectors.registerLink); }
  async getHeadingText() { return await this.getText(this.selectors.heroHeading); }
  async getLinkCount() { return await this.getElementCount(this.selectors.allLinks); }
  async getButtonCount() { return await this.getElementCount(this.selectors.allButtons); }
  async getHeadingCount() { return await this.getElementCount(this.selectors.allHeadings); }
}

module.exports = { LandingPage };
