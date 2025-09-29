// Shared page objects that work with both Cypress and Playwright

import { selectors, TenantUser } from './testData';

export interface FrameworkAdapter {
  goto(url: string): Promise<void>;
  fill(selector: string, value: string): Promise<void>;
  click(selector: string): Promise<void>;
  waitForSelector(selector: string): Promise<void>;
  getText(selector: string): Promise<string>;
  isVisible(selector: string): Promise<boolean>;
  screenshot(name: string): Promise<void>;
}

export class LoginPage {
  constructor(private adapter: FrameworkAdapter) {}
  
  async goto() {
    await this.adapter.goto('/login');
  }
  
  async login(user: TenantUser) {
    await this.adapter.fill(selectors.login.emailInput, user.email);
    await this.adapter.fill(selectors.login.passwordInput, user.password);
    await this.adapter.click(selectors.login.loginButton);
  }
  
  async getErrorMessage(): Promise<string> {
    await this.adapter.waitForSelector(selectors.login.errorMessage);
    return await this.adapter.getText(selectors.login.errorMessage);
  }
  
  async isLoginFormVisible(): Promise<boolean> {
    return await this.adapter.isVisible(selectors.login.emailInput);
  }
}

export class DashboardPage {
  constructor(private adapter: FrameworkAdapter) {}
  
  async waitForLoad() {
    await this.adapter.waitForSelector(selectors.dashboard.welcomeMessage);
  }
  
  async getWelcomeMessage(): Promise<string> {
    return await this.adapter.getText(selectors.dashboard.welcomeMessage);
  }
  
  async logout() {
    await this.adapter.click(selectors.dashboard.profileDropdown);
    await this.adapter.click(selectors.dashboard.logoutButton);
  }
  
  async navigateToMaintenance() {
    // Implementation depends on navigation structure
    await this.adapter.click('[data-testid="nav-maintenance"]');
  }
  
  async navigateToPayments() {
    await this.adapter.click('[data-testid="nav-payments"]');
  }
  
  async navigateToDocuments() {
    await this.adapter.click('[data-testid="nav-documents"]');
  }
}

export class MaintenancePage {
  constructor(private adapter: FrameworkAdapter) {}
  
  async createMaintenanceRequest(title: string, description: string, priority: string, category: string) {
    await this.adapter.click(selectors.maintenance.createButton);
    await this.adapter.fill(selectors.maintenance.titleInput, title);
    await this.adapter.fill(selectors.maintenance.descriptionInput, description);
    await this.adapter.click(selectors.maintenance.prioritySelect);
    await this.adapter.click(`[data-value="${priority}"]`);
    await this.adapter.click(selectors.maintenance.categorySelect);
    await this.adapter.click(`[data-value="${category}"]`);
    await this.adapter.click(selectors.maintenance.submitButton);
  }
  
  async getMaintenanceRequests(): Promise<string[]> {
    await this.adapter.waitForSelector(selectors.maintenance.requestsList);
    // Return array of request titles - implementation varies by framework
    return [];
  }
  
  async isMaintenanceRequestVisible(title: string): Promise<boolean> {
    return await this.adapter.isVisible(`[data-testid="request-${title}"]`);
  }
}

export class PaymentsPage {
  constructor(private adapter: FrameworkAdapter) {}
  
  async makePayment(amount: number, method: string) {
    await this.adapter.click(selectors.payments.makePaymentButton);
    await this.adapter.fill(selectors.payments.amountInput, amount.toString());
    await this.adapter.click(selectors.payments.paymentMethodSelect);
    await this.adapter.click(`[data-value="${method}"]`);
    await this.adapter.click(selectors.payments.confirmPaymentButton);
  }
  
  async getPaymentSuccessMessage(): Promise<string> {
    await this.adapter.waitForSelector(selectors.payments.paymentSuccessMessage);
    return await this.adapter.getText(selectors.payments.paymentSuccessMessage);
  }
  
  async getPaymentHistory(): Promise<any[]> {
    await this.adapter.waitForSelector(selectors.payments.paymentHistory);
    // Return payment history data - implementation varies
    return [];
  }
}

export class DocumentsPage {
  constructor(private adapter: FrameworkAdapter) {}
  
  async uploadDocument(filePath: string) {
    await this.adapter.click(selectors.documents.uploadButton);
    // File upload implementation varies by framework
  }
  
  async downloadDocument(documentName: string) {
    await this.adapter.click(`[data-document="${documentName}"] ${selectors.documents.downloadButton}`);
  }
  
  async getDocumentsList(): Promise<string[]> {
    await this.adapter.waitForSelector(selectors.documents.documentsGrid);
    // Return list of document names
    return [];
  }
}

// Factory for creating page objects with the appropriate adapter
export class PageObjectFactory {
  static createLoginPage(adapter: FrameworkAdapter): LoginPage {
    return new LoginPage(adapter);
  }
  
  static createDashboardPage(adapter: FrameworkAdapter): DashboardPage {
    return new DashboardPage(adapter);
  }
  
  static createMaintenancePage(adapter: FrameworkAdapter): MaintenancePage {
    return new MaintenancePage(adapter);
  }
  
  static createPaymentsPage(adapter: FrameworkAdapter): PaymentsPage {
    return new PaymentsPage(adapter);
  }
  
  static createDocumentsPage(adapter: FrameworkAdapter): DocumentsPage {
    return new DocumentsPage(adapter);
  }
}