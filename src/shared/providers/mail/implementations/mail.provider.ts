import { IEmailData, IMailProvider } from '../models/mail-provider.model';

export abstract class MailProvider implements IMailProvider {
  public async sendEmail(emailData: IEmailData): Promise<void> {
    return;
  }
}
