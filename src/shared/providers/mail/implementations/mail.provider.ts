import { IEmailData, IMailProvider } from '../models/mail-provider.model';

export class MailProvider implements IMailProvider {
  public async sendEmail(emailData: IEmailData): Promise<void> {
    return;
  }
}
