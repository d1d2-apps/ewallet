export interface IEmailData {
  from: {
    name: string;
    email: string;
  };
  to: {
    email: string;
  };
  subject: string;
  htmlContent: string;
}

export interface IMailProvider {
  sendEmail(emailData: IEmailData): Promise<void>;
}
