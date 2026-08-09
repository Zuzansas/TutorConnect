package com.example.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@tutorconnect.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {

            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Resetowanie hasła - TutorConnect");

            String htmlContent = """
                        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1ece8; border-radius: 12px; background-color: #ffffff;">
                            <h2 style="color: #d28b5b; text-align: center;">Resetowanie hasła</h2>
                            <p style="font-size: 1rem; color: #333333;">Cześć,</p>
                            <p style="font-size: 0.95rem; color: #555555; line-height: 1.5;">
                                Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w serwisie <b>TutorConnect</b>.
                                Kliknij poniższy przycisk, aby ustawić nowe hasło:
                            </p>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s" style="background-color: #d28b5b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                    Zresetuj hasło
                                </a>
                            </div>

                            <p style="font-size: 0.85rem; color: #777777;">
                                Link jest ważny przez <b>30 minut</b>. Jeśli to nie Ty prosiłeś o zmianę hasła, zignoruj tę wiadomość.
                            </p>
                            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                            <p style="font-size: 0.8rem; color: #aaaaaa; text-align: center;">
                                Zespół TutorConnect
                            </p>
                        </div>
                    """
                    .formatted(resetLink);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("📧 Pomyślnie wysłano e-mail z resetem hasła do: {}", toEmail);

        } catch (MessagingException e) {
            log.error("❌ Błąd podczas wysyłania e-maila do {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendActivationEmail(String toEmail, String fullName, String activationToken) {
        try {
            String activationLink = frontendUrl + "/activate?token=" + activationToken;

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Aktywacja konta - TutorConnect");

            String userName = (fullName != null && !fullName.isBlank()) ? fullName : "Użytkowniku";

            String htmlContent = """
                        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1ece8; border-radius: 12px; background-color: #ffffff;">
                            <h2 style="color: #d28b5b; text-align: center;">Potwierdź swój adres e-mail</h2>
                            <p style="font-size: 1rem; color: #333333;">Cześć <b>%s</b>,</p>
                            <p style="font-size: 0.95rem; color: #555555; line-height: 1.5;">
                                Dziękujemy za rejestrację w serwisie <b>TutorConnect</b>! Aby móc się zalogować i korzystać z serwisu, aktywuj swoje konto, klikając poniższy przycisk:
                            </p>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s" style="background-color: #d28b5b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                    Aktywuj konto
                                </a>
                            </div>

                            <p style="font-size: 0.85rem; color: #777777;">
                                Link aktywacyjny jest ważny przez <b>24 godziny</b>.
                            </p>
                            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                            <p style="font-size: 0.8rem; color: #aaaaaa; text-align: center;">
                                Pozdrawiamy,<br/>Zespół TutorConnect
                            </p>
                        </div>
                    """
                    .formatted(userName, activationLink);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("📧 Pomyślnie wysłano e-mail aktywacyjny do: {}", toEmail);

        } catch (MessagingException e) {
            log.error("❌ Błąd podczas wysyłania e-maila aktywacyjnego do {}: {}", toEmail, e.getMessage());
        }
    }
}