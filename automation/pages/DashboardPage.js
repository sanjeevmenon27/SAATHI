/**
 * SaathiCare E2E — Dashboard Page Object
 */
const { By } = require("selenium-webdriver");
const { BasePage } = require("./BasePage");

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.selectors = {
      dashboardContainer: By.xpath("//main | //div[contains(@class, 'dashboard')]"),
      logoutButton: By.xpath("//button[contains(text(), 'Logout')] | //button[contains(text(), 'Sign out')]"),
      userGreeting: By.xpath("//*[contains(text(), 'Welcome')] | //*[contains(text(), 'Hello')]"),
      navigationTabs: By.xpath("//nav//a | //nav//button"),
      cards: By.xpath("//*[contains(@class, 'card')] | //*[contains(@class, 'rounded')]"),
      bookingSection: By.xpath("//*[contains(text(), 'Booking')] | //*[contains(text(), 'booking')]"),
    };
  }

  async open() { await this.navigate("/dashboard"); }
  async isDashboardVisible() { return await this.isDisplayed(this.selectors.dashboardContainer); }
  async getCardCount() { return await this.getElementCount(this.selectors.cards); }
}

module.exports = { DashboardPage };
