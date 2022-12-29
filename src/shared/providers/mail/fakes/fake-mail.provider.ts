import { IEmailData, IMailProvider } from '../models/mail-provider.model';

export class FakeMailProvider implements IMailProvider {
  private messages: IEmailData[] = [];

  public async sendEmail(emailData: IEmailData): Promise<void> {
    this.messages.push(emailData);
  }
}
