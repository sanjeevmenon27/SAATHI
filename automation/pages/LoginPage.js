/**
 * SaathiCare E2E — Login Page Object
 */
const { By } = require("selenium-webdriver");
const { BasePage } = require("./BasePage");

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.selectors = {
      emailInput: By.xpath("//input[@type='email'] | //input[@name='email']"),
      passwordInput: By.xpath("//input[@type='password'] | //input[@name='password']"),
      submitButton: By.xpath("//button[@type='submit']"),
      errorMessage: By.xpath("//*[contains(@class, 'error')] | //*[contains(@class, 'text-red')] | //*[contains(@role, 'alert')]"),
      registerLink: By.xpath("//a[contains(@href, '/register')] | //a[contains(text(), 'Register')] | //a[contains(text(), 'Sign up')]"),
      formContainer: By.xpath("//form"),
      pageTitle: By.css("h1, h2"),
    };
  }

  async open() { await this.navigate("/login"); }
  async enterEmail(email) { await this.type(this.selectors.emailInput, email); }
  async enterPassword(password) { await this.type(this.selectors.passwordInput, password); }
  async clickSubmit() { await this.click(this.selectors.submitButton); }
  async login(email, password) { await this.enterEmail(email); await this.enterPassword(password); await this.clickSubmit(); }
  async getErrorMessage() { return await this.getText(this.selectors.errorMessage); }
  async isFormVisible() { return await this.isDisplayed(this.selectors.formContainer); }
  async isEmailInputEnabled() { return await this.isEnabled(this.selectors.emailInput); }
  async isPasswordInputEnabled() { return await this.isEnabled(this.selectors.passwordInput); }
  async isSubmitEnabled() { return await this.isEnabled(this.selectors.submitButton); }
  async getEmailValue() { return await this.getAttribute(this.selectors.emailInput, "value"); }
  async getPasswordType() { return await this.getAttribute(this.selectors.passwordInput, "type"); }
}

module.exports = { LoginPage };
