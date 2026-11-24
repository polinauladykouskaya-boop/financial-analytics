const nodemailer = require('nodemailer');

const requiredEnv = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS'
];

for (const key of requiredEnv) {
    if (!process.env[key]) {
        console.error(`[SMTP] Не задана переменная окружения: ${key}`);
    }
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Проверка подключения к SMTP при запуске сервера.
transporter.verify()
    .then(() => {
        console.log('[SMTP] Подключение к почтовому серверу успешно.');
    })
    .catch((error) => {
        console.error('[SMTP] Ошибка подключения к почтовому серверу:');
        console.error('Код ошибки:', error.code);
        console.error('Ответ сервера:', error.response);
        console.error(error);
    });


const sendPasswordResetEmail = async (email, resetUrl) => {
    console.log('[SMTP] Начинаем отправку письма.');
    console.log('[SMTP] Получатель:', email);
    console.log('[SMTP] Сервер:', process.env.SMTP_HOST);
    console.log('[SMTP] Порт:', process.env.SMTP_PORT);

    try {
        const result = await transporter.sendMail({
            from: `"FinSight" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Восстановление пароля FinSight',

            text: [
                'Вы запросили восстановление пароля FinSight.',
                '',
                `Для установки нового пароля перейдите по ссылке: ${resetUrl}`,
                '',
                'Ссылка действует 15 минут.',
                'Если вы не запрашивали восстановление, просто проигнорируйте это письмо.'
            ].join('\n'),

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                ">
                    <h2>Восстановление пароля FinSight</h2>

                    <p>Вы запросили восстановление пароля.</p>

                    <p>
                        Чтобы установить новый пароль, нажмите на кнопку:
                    </p>

                    <p>
                        <a
                            href="${resetUrl}"
                            style="
                                display: inline-block;
                                padding: 12px 24px;
                                background-color: #2563eb;
                                color: #ffffff;
                                text-decoration: none;
                                border-radius: 6px;
                            "
                        >
                            Изменить пароль
                        </a>
                    </p>

                    <p>Ссылка действует 15 минут.</p>

                    <p>
                        Если вы не запрашивали восстановление пароля,
                        просто проигнорируйте это письмо.
                    </p>
                </div>
            `
        });

        console.log('[SMTP] Письмо передано почтовому серверу.');
        console.log('[SMTP] Message ID:', result.messageId);
        console.log('[SMTP] Accepted:', result.accepted);
        console.log('[SMTP] Rejected:', result.rejected);
        console.log('[SMTP] Response:', result.response);

        return result;
    } catch (error) {
        console.error('[SMTP] Не удалось отправить письмо.');
        console.error('[SMTP] Код ошибки:', error.code);
        console.error('[SMTP] Ответ сервера:', error.response);
        console.error(error);

        throw error;
    }
};


module.exports = {
    sendPasswordResetEmail
};