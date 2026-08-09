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

    @Async
    public void sendPackagePurchaseConfirmationEmail(String toEmail, String userName, String packageTitle,
            int totalLessons, java.math.BigDecimal price) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Potwierdzenie zakupu pakietu lekcji - TutorConnect");

            String displayName = (userName != null && !userName.isBlank()) ? userName : "Klincie";

            String htmlContent = """
                        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1ece8; border-radius: 12px; background-color: #ffffff;">
                            <h2 style="color: #d28b5b; text-align: center;">Dziękujemy za zakup! 💳</h2>
                            <p style="font-size: 1rem; color: #333333;">Cześć <b>%s</b>,</p>
                            <p style="font-size: 0.95rem; color: #555555; line-height: 1.5;">
                                Płatność przebiegła pomyślnie. Twój nowy pakiet lekcji został aktywowany i jest gotowy do wykorzystania!
                            </p>

                            <div style="background-color: #faf8f5; border: 1px solid #f1ece8; border-radius: 10px; padding: 15px; margin: 20px 0;">
                                <h3 style="color: #2c3e50; margin-top: 0; font-size: 1.1rem;">Szczegóły zamówienia:</h3>
                                <ul style="color: #555555; line-height: 1.6; padding-left: 20px; margin: 0;">
                                    <li><b>Pakiet:</b> %s</li>
                                    <li><b>Liczba lekcji w pakiecie:</b> %d</li>
                                    <li><b>Zapłacono:</b> %s PLN</li>
                                </ul>
                            </div>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s/reservations" style="background-color: #d28b5b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                    Zarezerwuj pierwszą lekcję
                                </a>
                            </div>

                            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                            <p style="font-size: 0.8rem; color: #aaaaaa; text-align: center;">
                                Pozdrawiamy,<br/>Zespół TutorConnect
                            </p>
                        </div>
                    """
                    .formatted(displayName, packageTitle, totalLessons, price, frontendUrl);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("📧 Pomyślnie wysłano e-mail z potwierdzeniem zakupu do: {}", toEmail);

        } catch (MessagingException e) {
            log.error("❌ Błąd podczas wysyłania e-maila o zakupie pakietu do {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendReservationConfirmationEmail(
            String toEmail,
            String studentName,
            String lessonTitle,
            java.time.Instant startTime,
            java.time.Instant endTime,
            int remainingLessons) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Potwierdzenie rezerwacji lekcji - TutorConnect");

            String displayName = (studentName != null && !studentName.isBlank()) ? studentName : "Uczniu";

            java.time.ZoneId zoneId = java.time.ZoneId.of("Europe/Warsaw");
            java.time.ZonedDateTime startZdt = startTime.atZone(zoneId);
            java.time.ZonedDateTime endZdt = endTime.atZone(zoneId);

            java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter
                    .ofPattern("dd MMMM yyyy", new java.util.Locale("pl"));
            java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");

            String dateStr = startZdt.format(dateFormatter);
            String startStr = startZdt.format(timeFormatter);
            String endStr = endZdt.format(timeFormatter);

            String htmlContent = """
                        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1ece8; border-radius: 12px; background-color: #ffffff;">
                            <h2 style="color: #d28b5b; text-align: center;">Rezerwacja potwierdzona! 📅</h2>
                            <p style="font-size: 1rem; color: #333333;">Cześć <b>%s</b>,</p>
                            <p style="font-size: 0.95rem; color: #555555; line-height: 1.5;">
                                Twój termin zajęć został pomyślnie zarejestrowany w systemie. Oto szczegóły spotkania:
                            </p>

                            <div style="background-color: #faf8f5; border: 1px solid #f1ece8; border-radius: 10px; padding: 15px; margin: 20px 0;">
                                <h3 style="color: #2c3e50; margin-top: 0; font-size: 1.1rem;">Szczegóły lekcji:</h3>
                                <ul style="color: #555555; line-height: 1.8; padding-left: 20px; margin: 0;">
                                    <li><b>Lekcja:</b> %s</li>
                                    <li><b>Data:</b> %s</li>
                                    <li><b>Godzina:</b> %s - %s</li>
                                    <li><b>Pozostało lekcji w pakiecie:</b> <b style="color: #d28b5b;">%d</b></li>
                                </ul>
                            </div>

                            <p style="font-size: 0.85rem; color: #777777;">
                                W razie potrzeby odwołania lekcji, pamiętaj, aby zrobić to z minimum 12-godzinnym wyprzedzeniem w zakładce Moje Rezerwacje, aby zachować lekcję w pakiecie.
                            </p>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s/reservations" style="background-color: #d28b5b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                    Zobacz w panelu
                                </a>
                            </div>

                            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                            <p style="font-size: 0.8rem; color: #aaaaaa; text-align: center;">
                                Pozdrawiamy,<br/>Zespół TutorConnect
                            </p>
                        </div>
                    """
                    .formatted(displayName, lessonTitle, dateStr, startStr, endStr, remainingLessons, frontendUrl);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("📧 Pomyślnie wysłano e-mail potwierdzający rezerwację do: {}", toEmail);

        } catch (MessagingException e) {
            log.error("❌ Błąd podczas wysyłania e-maila o rezerwacji do {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendReservationCancellationEmail(
            String toEmail,
            String studentName,
            String lessonTitle,
            java.time.Instant startTime,
            boolean isRefunded,
            boolean cancelledByAdmin) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);

            String subject = cancelledByAdmin
                    ? "Odwołanie zajęć przez edukatora - TutorConnect"
                    : "Potwierdzenie odwołania rezerwacji - TutorConnect";
            helper.setSubject(subject);

            String displayName = (studentName != null && !studentName.isBlank()) ? studentName : "Uczniu";

            // Formatowanie daty i godziny
            java.time.ZoneId zoneId = java.time.ZoneId.of("Europe/Warsaw");
            java.time.ZonedDateTime startZdt = startTime.atZone(zoneId);

            java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter
                    .ofPattern("dd MMMM yyyy", new java.util.Locale("pl"));
            java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");

            String dateStr = startZdt.format(dateFormatter);
            String startStr = startZdt.format(timeFormatter);

            String refundInfoText = isRefunded
                    ? "<b>1 lekcja została zwrócona</b> do Twojego pakietu."
                    : "<b style='color: #e74c3c;'>Lekcja NIE została zwrócona</b> do pakietu (odwołanie nastąpiło na mniej niż 12h przed zajęciami).";

            String reasonText = cancelledByAdmin
                    ? "Zajęcia zostały odwołane przez edukatora. " + refundInfoText
                    : "Twoje odwołanie lekcji zostało zarejestrowane. " + refundInfoText;

            String htmlContent = """
                        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1ece8; border-radius: 12px; background-color: #ffffff;">
                            <h2 style="color: #e74c3c; text-align: center;">Lekcja została odwołana ❌</h2>
                            <p style="font-size: 1rem; color: #333333;">Cześć <b>%s</b>,</p>
                            <p style="font-size: 0.95rem; color: #555555; line-height: 1.5;">
                                Informujemy, że poniższy termin lekcji został anulowany w systemie TutorConnect:
                            </p>

                            <div style="background-color: #faf8f5; border: 1px solid #f1ece8; border-radius: 10px; padding: 15px; margin: 20px 0;">
                                <h3 style="color: #2c3e50; margin-top: 0; font-size: 1.1rem;">Odwołane zajęcia:</h3>
                                <ul style="color: #555555; line-height: 1.8; padding-left: 20px; margin: 0;">
                                    <li><b>Lekcja:</b> %s</li>
                                    <li><b>Data:</b> %s</li>
                                    <li><b>Godzina:</b> %s</li>
                                </ul>
                            </div>

                            <div style="background-color: #fdf2f2; border-left: 4px solid #e74c3c; padding: 12px 15px; margin-bottom: 20px; border-radius: 4px;">
                                <p style="margin: 0; font-size: 0.9rem; color: #c0392b; line-height: 1.4;">
                                    %s
                                </p>
                            </div>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s/reservations" style="background-color: #d28b5b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                    Przejdź do moich rezerwacji
                                </a>
                            </div>

                            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                            <p style="font-size: 0.8rem; color: #aaaaaa; text-align: center;">
                                Pozdrawiamy,<br/>Zespół TutorConnect
                            </p>
                        </div>
                    """
                    .formatted(displayName, lessonTitle, dateStr, startStr, reasonText, frontendUrl);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("📧 Pomyślnie wysłano e-mail o anulowaniu rezerwacji do: {}", toEmail);

        } catch (MessagingException e) {
            log.error("❌ Błąd podczas wysyłania e-maila o anulowaniu rezerwacji do {}: {}", toEmail, e.getMessage());
        }
    }
}