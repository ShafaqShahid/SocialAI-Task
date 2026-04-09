class AuthPage {
  constructor(page) {
    this.page = page;
    this.authCard = page.getByTestId('auth-card');
    this.dashboard = page.getByTestId('dashboard');
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.loginButton = page.getByTestId('login-btn');
    this.registerButton = page.getByTestId('register-btn');
    this.authError = page.getByTestId('auth-error');
  }

  async open() {
    await this.page.goto('/');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async register(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.registerButton.click();
  }
}

module.exports = { AuthPage };
