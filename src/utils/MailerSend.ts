import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

export const sendOrderEmail = async (toEmail: string, orderId: string) => {
  const sentFrom = new Sender("ventas@trick.pe", "TRICKS SAC");

  const recipients = [new Recipient(toEmail, "Cliente")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(`Confirmación de tu pedido #${orderId}`)
    .setHtml(`<p>Hola,</p>
              <p>Tu pedido con número <b>${orderId}</b> ha sido generado con éxito.</p>
              <p>Gracias por comprar en TRICKS SAC 🎉</p>`)
    .setText(`Tu pedido con número ${orderId} ha sido generado con éxito.`);

  await mailersend.email.send(emailParams);
};
