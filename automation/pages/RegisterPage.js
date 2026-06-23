/**
 * SaathiCare E2E — Register Page Object
 */
const { By } = require("selenium-webdriver");
const { BasePage } = require("./BasePage");

class RegisterPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.selectors = {
      nameInput: By.xpath("//input[@name='name']"),
      emailInput: By.xpath("//input[@name='email'] | //input[@type='email']"),
      passwordInput: By.xpath("//input[@name='password'] | //input[@type='password']"),
      phoneInput: By.xpath("//input[@name='phone'] | //input[@type='tel']"),
      addressInput: By.xpath("//input[@name='address'] | //textarea[@name='address']"),
      roleSelect: By.xpath("//select[@name='role'] | //div[contains(@class, 'role')]//button | //input[@name='role']"),
      submitButton: By.xpath("//button[@type='submit']"),
      loginLink: By.xpath("//a[contains(@href, '/login')] | //a[contains(text(), 'Login')] | //a[contains(text(), 'Sign in')]"),
      formContainer: By.xpath("//form"),
      errorMessage: By.xpath("//*[contains(@class, 'error')] | //*[contains(@class, 'text-red')] | //*[contains(@role, 'alert')]"),
      pageTitle: By.css("h1, h2"),
    };
  }

  async open() { await this.navigate("/register"); }
  async enterName(name) { await this.type(this.selectors.nameInput, name); }
  async enterEmail(email) { await this.type(this.selectors.emailInput, email); }
  async enterPassword(password) { await this.type(this.selectors.passwordInput, password); }
  async clickSubmit() { await this.click(this.selectors.submitButton); }
  async isFormVisible() { return await this.isDisplayed(this.selectors.formContainer); }
  async isNameInputVisible() { return await this.isDisplayed(this.selectors.nameInput); }
  async isPhoneInputVisible() { return await this.isDisplayed(this.selectors.phoneInput); }
}

module.exports = { RegisterPage };
