import mjml2html from 'mjml';

import { UserModel } from '@src/modules/users/models/user.model';

import { ResetPasswordTokenModel } from '../models/reset-password-token.model';

export function parseForgotPasswordEmailTemplate(user: UserModel, resetPasswordToken: ResetPasswordTokenModel): string {
  const link = `${process.env.WEB_URL}/reset-password?token=${resetPasswordToken.id}`;

  const { html } = mjml2html(`
    <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text font-size="32px" font-weight="700" color="#EF8354" font-family="sans-serif" align="center">eWallet</mj-text>
    
            <mj-divider border-color="#EF8354"></mj-divider>

            <mj-text font-size="20px" font-weight="400" color="#2D3142" font-family="sans-serif">
              Olá ${user.name},
            </mj-text>
    
            <mj-text font-size="20px" font-weight="400" color="#2D3142" font-family="sans-serif">
              Utilize o link abaixo para fazer a recuperação da sua senha de acesso para o eWallet.
            </mj-text>
    
            <mj-text font-size="18px" font-weight="400" color="#2D3142" font-family="sans-serif">
              Atenção: o link abaixo irá expirar em 15 minutos. Caso esse limite de tempo seja ultrapassado, você terá de fazer uma nova solicitação de recuperação de senha.
            </mj-text>
    
            <mj-spacer></mj-spacer>
    
            <mj-button
              font-size="16px"
              font-weight="700"
              color="#000000"
              background-color="#EF8354"
              font-family="sans-serif"
              href="${link}"
            >
              Recuperar senha
            </mj-button>
    
            <mj-spacer></mj-spacer>
            <mj-spacer></mj-spacer>
            <mj-spacer></mj-spacer>
    
            <mj-text font-size="16px" font-weight="400" color="#2D3142" font-family="sans-serif">
              Se você não fez a solicitação de recuperação de senha basta ignorar esse email.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `);

  return html;
}
