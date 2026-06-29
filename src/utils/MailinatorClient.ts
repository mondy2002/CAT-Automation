interface MailinatorMessage {
  id: string;
  subject: string;
  from: string;
  to: string;
  time: number;
  been_read: boolean;
}

interface InboxResponse {
  msgs: MailinatorMessage[];
}

interface LinksResponse {
  links: string[];
}

export class MailinatorClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://mailinator.com/api/v2';
  private readonly domain = 'mailinator.com';

  constructor() {
    this.apiKey = process.env.MAILINATOR_API_KEY ?? '';
    if (!this.apiKey) throw new Error('MAILINATOR_API_KEY is not set in .env');
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { Authorization: this.apiKey },
    });
    if (!res.ok) {
      throw new Error(`Mailinator GET ${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  async clearInbox(inbox: string): Promise<void> {
    await fetch(
      `${this.baseUrl}/domains/${this.domain}/inboxes/${inbox}/messages`,
      { method: 'DELETE', headers: { Authorization: this.apiKey } },
    );
  }

  async getInbox(inbox: string): Promise<MailinatorMessage[]> {
    const data = await this.get<InboxResponse>(
      `/domains/${this.domain}/inboxes/${inbox}?sort=desc`,
    );
    return data.msgs ?? [];
  }

  async waitForMessage(
    inbox: string,
    timeoutMs = 60000,
    pollIntervalMs = 4000,
  ): Promise<MailinatorMessage> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const msgs = await this.getInbox(inbox);
      if (msgs.length > 0) return msgs[0];
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
    throw new Error(
      `No email arrived in ${inbox}@${this.domain} within ${timeoutMs}ms`,
    );
  }

  async getLinks(messageId: string): Promise<string[]> {
    const data = await this.get<LinksResponse>(`/message/${messageId}/links`);
    return data.links ?? [];
  }

  async getResetPasswordLink(inbox: string, timeoutMs = 60000): Promise<string> {
    const msg = await this.waitForMessage(inbox, timeoutMs);
    const links = await this.getLinks(msg.id);
    const resetLink = links.find(
      (l) => /reset|password|set-pass/i.test(l),
    );
    if (!resetLink) {
      throw new Error(
        `No reset-password link found in email. Links found: ${links.join(', ')}`,
      );
    }
    return resetLink;
  }

  static inboxFromEmail(email: string): string {
    return email.split('@')[0];
  }
}
