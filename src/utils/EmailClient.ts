// 1secmail — completely free disposable email service, no API key required.
// Docs: https://www.1secmail.com/api/
// Supported domains: 1secmail.com | 1secmail.net | 1secmail.org
// Just use any address at those domains, e.g. cat-portal-reset@1secmail.com

interface SecMailMessage {
  id: number;
  from: string;
  subject: string;
  date: string;
}

interface SecMailMessageDetail extends SecMailMessage {
  attachments: unknown[];
  body: string;
  htmlBody: string;
  textBody: string;
}

export class EmailClient {
  private readonly baseUrl = 'https://www.1secmail.com/api/v1';

  private splitEmail(email: string): { login: string; domain: string } {
    const [login, domain] = email.split('@');
    return { login, domain };
  }

  private async get<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`1secmail request failed: ${res.status} ${res.statusText} — ${url}`);
    return res.json() as Promise<T>;
  }

  async getMessages(email: string): Promise<SecMailMessage[]> {
    const { login, domain } = this.splitEmail(email);
    return this.get<SecMailMessage[]>(
      `${this.baseUrl}/?action=getMessages&login=${login}&domain=${domain}`,
    );
  }

  async getMessage(email: string, id: number): Promise<SecMailMessageDetail> {
    const { login, domain } = this.splitEmail(email);
    return this.get<SecMailMessageDetail>(
      `${this.baseUrl}/?action=readMessage&login=${login}&domain=${domain}&id=${id}`,
    );
  }

  extractLinks(html: string): string[] {
    const matches = html.match(/https?:\/\/[^\s"'<>()[\]]+/g) ?? [];
    return [...new Set(matches)];
  }

  async waitForMessage(
    email: string,
    timeoutMs = 60000,
    pollIntervalMs = 4000,
  ): Promise<SecMailMessage> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const msgs = await this.getMessages(email);
      if (msgs.length > 0) return msgs[0];
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
    throw new Error(`No email arrived at ${email} within ${timeoutMs}ms`);
  }

  async getResetPasswordLink(email: string, timeoutMs = 60000): Promise<string> {
    const msg = await this.waitForMessage(email, timeoutMs);
    const detail = await this.getMessage(email, msg.id);
    const body = detail.htmlBody || detail.textBody || detail.body || '';
    const links = this.extractLinks(body);
    const resetLink = links.find((l) => /reset|password|set-pass/i.test(l));
    if (!resetLink) {
      throw new Error(`No reset link found in email. All links: ${links.join(', ')}`);
    }
    return resetLink;
  }
}
