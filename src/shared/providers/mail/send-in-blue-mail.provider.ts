import * as SibApiV3Sdk from '@sendinblue/client';
import { IEmailData, IMailProvider } from './mail.provider';

export class SendInBlueMailProvider implements IMailProvider {
  public async sendEmail(emailData: IEmailData): Promise<void> {
    const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    transactionalEmailApi.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.SENDINBLUE_API_KEY);

    await transactionalEmailApi.sendTransacEmail({
      sender: {
        email: emailData.from.email,
        name: emailData.from.name,
      },
      to: [
        {
          email: emailData.to.email,
        },
      ],
      subject: emailData.subject,
      htmlContent: emailData.htmlContent,
    });
  }
}
