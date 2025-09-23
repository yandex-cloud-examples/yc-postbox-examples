# Клиент Yandex Cloud Postbox API для Node.js

> **⚠️ Отказ от ответственности:** Этот код предназначен только для демонстрационных целей и **не должен** использоваться в производственной среде. Для производственного использования, пожалуйста, используйте официальный AWS SDK для безопасной, надежной и полностью поддерживаемой реализации.

Клиент на чистом JavaScript для отправки электронных писем через API Yandex Cloud Postbox. Эта реализация использует только стандартные JavaScript API (fetch, Web Crypto API) и не требует внешних зависимостей.

## Возможности

- ✅ **Чистый JavaScript** - Никаких внешних зависимостей, использует только стандартные Node.js API
- ✅ **AWS Signature V4** - Правильная реализация аутентификации
- ✅ **Несколько типов писем** - Поддержка простых, шаблонных и raw-писем
- ✅ **Современный Async/Await** - Чистый API на основе промисов
- ✅ **Node.js 18+** - Использует нативные Web Crypto API и fetch
- ✅ **Обработка ошибок** - Комплексная обработка ошибок с подробными сообщениями
- ✅ **Валидация входных данных** - Валидация email-адресов и обязательных полей
- ✅ **Логика повторов** - Экспоненциальная задержка с джиттером для временных сбоев
- ✅ **Ограничение скорости** - Защита от превышения лимитов на стороне клиента
- ✅ **Тайм-аут запросов** - Настраиваемый тайм-аут с AbortController
- ✅ **Отладочное логирование** - Опциональный режим отладки для устранения неполадок
- ✅ **Поддержка TypeScript** - Полные определения типов TypeScript включены

## Быстрый старт

### 1. Установка и настройка

```javascript
const PostboxClient = require('./main.js');

const client = new PostboxClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ru-central1', // По умолчанию: ru-central1
    host: 'postbox.cloud.yandex.net', // Хост по умолчанию
    timeout: 30000, // Тайм-аут запроса в мс (по умолчанию: 30000)
    maxRetries: 3, // Максимальное количество повторов (по умолчанию: 3)
    maxJitter: 1000, // Максимальный джиттер для повторов в мс (по умолчанию: 1000)
    minRequestInterval: 100, // Минимальный интервал между запросами в мс (по умолчанию: 100)
    debug: false // Включить отладочное логирование (по умолчанию: false)
});
```

### 2. Отправка простого письма

```javascript
try {
    const result = await client.sendSimpleEmail({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Привет, мир!',
        textContent: 'Это простое текстовое письмо',
        htmlContent: '<h1>Привет, мир!</h1><p>Это HTML письмо</p>'
    });

    console.log('Письмо отправлено! ID сообщения:', result.MessageId);
} catch (error) {
    console.error('Не удалось отправить письмо:', error.message);
}
```

### 3. Отправка письма по шаблону

```javascript
const result = await client.sendTemplateEmail({
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    templateContent: {
        Subject: 'Добро пожаловать {{name}}!',
        Text: 'Привет {{name}}, добро пожаловать в {{company}}!',
        Html: '<h1>Привет {{name}}</h1><p>Добро пожаловать в {{company}}!</p>'
    },
    templateData: {
        name: 'Иван Иванов',
        company: 'Acme Corp'
    }
});
```

### 4. Отправка raw-письма

```javascript
const result = await client.sendRawEmail({
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    rawData: 'base64_encoded_mime_message'
});
```

## Справочник API

### Параметры конструктора

| Параметр             | Тип     | По умолчанию               | Описание                                          |
|----------------------|---------|----------------------------|---------------------------------------------------|
| `accessKeyId`        | string  | обязательный               | ID ключа доступа Yandex Cloud                     |
| `secretAccessKey`    | string  | обязательный               | Секретный ключ доступа Yandex Cloud              |
| `region`             | string  | `ru-central1`              | Регион Yandex Cloud                               |
| `host`               | string  | `postbox.cloud.yandex.net` | Хост API эндпоинта                                |
| `timeout`            | number  | `30000`                    | Тайм-аут запроса в миллисекундах                  |
| `maxRetries`         | number  | `3`                        | Максимальное количество повторов для неудачных запросов |
| `maxJitter`          | number  | `1000`                     | Максимальный джиттер для задержки повторов (мс)   |
| `minRequestInterval` | number  | `100`                      | Минимальный интервал между запросами (мс)         |
| `debug`              | boolean | `false`                    | Включить отладочное логирование                   |

### Параметры простого письма

| Параметр               | Тип           | Обязательный | Описание                                  |
|------------------------|---------------|--------------|-------------------------------------------|
| `from`                 | string        | ✅            | Email адрес отправителя (должен быть верифицирован) |
| `to`                   | string\|array | ✅            | Email адрес(а) получателя                 |
| `subject`              | string        | ✅            | Тема письма                               |
| `textContent`          | string        | ❌            | Текстовое содержимое                      |
| `htmlContent`          | string        | ❌            | HTML содержимое                           |
| `cc`                   | array         | ❌            | Получатели копии                          |
| `bcc`                  | array         | ❌            | Получатели скрытой копии                  |
| `configurationSetName` | string        | ❌            | Имя набора конфигурации                   |
| `customHeaders`        | array         | ❌            | Пользовательские заголовки письма         |

### Параметры письма по шаблону

| Параметр               | Тип           | Обязательный | Описание                                      |
|------------------------|---------------|--------------|-----------------------------------------------|
| `from`                 | string        | ✅            | Email адрес отправителя                       |
| `to`                   | string\|array | ✅            | Email адрес(а) получателя                     |
| `templateContent`      | object        | ✅            | Содержимое шаблона с Subject, Text, Html      |
| `templateData`         | object        | ✅            | Данные для подстановки в шаблон               |
| `cc`                   | array         | ❌            | Получатели копии                              |
| `bcc`                  | array         | ❌            | Получатели скрытой копии                      |
| `configurationSetName` | string        | ❌            | Имя набора конфигурации                       |
| `customHeaders`        | array         | ❌            | Пользовательские заголовки письма             |

### Параметры raw-письма

| Параметр               | Тип           | Обязательный | Описание                         |
|------------------------|---------------|--------------|----------------------------------|
| `from`                 | string        | ✅            | Email адрес отправителя          |
| `to`                   | string\|array | ✅            | Email адрес(а) получателя        |
| `rawData`              | string        | ✅            | Base64 закодированные raw данные письма |
| `cc`                   | array         | ❌            | Получатели копии                 |
| `bcc`                  | array         | ❌            | Получатели скрытой копии         |
| `configurationSetName` | string        | ❌            | Имя набора конфигурации          |

## Переменные окружения

Настройте переменные окружения для безопасного управления учетными данными:

```bash
export AWS_ACCESS_KEY_ID="your_access_key_id"
export AWS_SECRET_ACCESS_KEY="your_secret_access_key"
```

Или создайте файл `.env`:

```bash
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

## Обработка ошибок

Клиент выбрасывает описательные ошибки для различных сценариев:

```javascript
try {
    await client.sendSimpleEmail(options);
} catch (error) {
    if (error.message.includes('API Error')) {
        // API вернул ответ с ошибкой (включает Request ID для отладки)
        console.error('Ошибка API:', error.message);
        // Пример: "API Error 403: Forbidden: Access denied (Request ID: abc123-def456)"
    } else if (error.message.includes('Network error')) {
        // Проблема с сетью/подключением
        console.error('Сетевая ошибка:', error.message);
    } else {
        // Другие ошибки (валидация и т.д.)
        console.error('Ошибка:', error.message);
    }
}
```

## Частые ошибки API

| Код ошибки                                   | Описание                              |
|----------------------------------------------|---------------------------------------|
| `BadRequestException`                        | Неверные параметры запроса            |
| `BadRequestException: sender is not allowed` | Отправитель не в списке разрешенных   |
| `AccountSuspendedException`                  | Аккаунт заблокирован навсегда         |
| `SendingPausedException`                     | Аккаунт заблокирован временно         |
| `MessageRejected`                            | Неверные данные письма                |
| `MailFromDomainNotVerifiedException`         | Адрес отправителя не верифицирован    |
| `NotFoundException`                          | Ресурс не найден                      |
| `TooManyRequestsException`                   | Превышен лимит скорости               |
| `LimitExceededException`                     | Превышена квота                       |

### Ошибки HTTP статус-кодов

| Статус | Описание              | Частые причины                                                     |
|--------|-----------------------|--------------------------------------------------------------------|
| `400`  | Bad Request           | Неверный JSON, отсутствуют обязательные поля                      |
| `401`  | Unauthorized          | Неверный ключ доступа или секрет                                   |
| `403`  | Forbidden             | Учетные данные верны, но нет прав, отправитель не верифицирован    |
| `404`  | Not Found             | Неверный URL API эндпоинта                                         |
| `429`  | Too Many Requests     | Ограничение скорости, замедлите запросы                            |
| `500`  | Internal Server Error | Временные проблемы сервера                                         |

## Устранение неполадок

### Ошибка 403 Forbidden

Это самая частая ошибка при начале работы с Postbox API:

```text
API Error 403: Forbidden: Access denied - check your credentials and permissions (Request ID: abc123-def456-789xyz)
```

**Возможные причины:**

1. **Email отправителя не верифицирован** - Верифицируйте ваш домен/email отправителя в консоли Yandex Cloud
2. **Неправильный сервисный аккаунт** - Убедитесь, что ваши ключи доступа принадлежат правильному сервисному аккаунту
3. **Отсутствуют права IAM** - Сервисный аккаунт должен иметь роль `postbox.editor` или выше
4. **Неверная подпись** - Проверьте, синхронизированы ли часы вашей системы

💡 **Примечание:** Все сообщения об ошибках включают Request ID для целей отладки. Включите этот ID при обращении в поддержку.

## Требования

- **Node.js**: Node.js 18.0+ (для поддержки нативного Web Crypto API и fetch)
- **Никаких дополнительных зависимостей** - Использует только встроенные Node.js API

## Заметки по безопасности

⚠️ **Важные соображения безопасности:**

1. **Используйте переменные окружения** для хранения ключей доступа в продакшене
2. **Никогда не хардкодьте учетные данные** в исходном коде
3. **Реализуйте правильные средства контроля доступа** в вашем приложении
4. **Верифицируйте адреса отправителей** в конфигурации Yandex Cloud Postbox
5. **Используйте безопасные сетевые соединения** - API использует HTTPS по умолчанию

## Запуск примера

1. Установите переменные окружения:

```bash
export AWS_ACCESS_KEY_ID="your_access_key_id"
export AWS_SECRET_ACCESS_KEY="your_secret_access_key"
```

2. Запустите пример:

```bash
node example.js
```

Пример включает:

- ✅ Отправку простых писем
- ✅ Письма по шаблону с подстановкой переменных
- ✅ Письма с получателями копии и скрытой копии
- ✅ Обработку ошибок и валидацию

## Пользовательское использование

Для ваших собственных проектов создайте новый файл с вашей специфической логикой отправки писем:

```javascript
const PostboxClient = require('./main.js');

async function sendWelcomeEmail(userEmail, userName) {
    const client = new PostboxClient({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    try {
        const result = await client.sendSimpleEmail({
            from: 'noreply@yourcompany.com', // Ваш верифицированный отправитель
            to: [userEmail],
            subject: `Добро пожаловать ${userName}!`,
            textContent: `Привет ${userName}, добро пожаловать на нашу платформу!`,
            htmlContent: `<h1>Добро пожаловать ${userName}!</h1><p>Спасибо за присоединение к нам.</p>`
        });

        console.log('✅ Приветственное письмо отправлено!');
        return result.MessageId;
    } catch (error) {
        console.error('❌ Не удалось отправить приветственное письмо:', error.message);
        throw error;
    }
}

// Использование
sendWelcomeEmail('user@example.com', 'Иван Иванов');
```

📋 **См. `example.js` для комплексных примеров, включающих письма по шаблону, копии/скрытые копии и обработку ошибок.**

## Лицензия

Эта реализация предоставляется как есть для образовательных и развивающих целей.

---

# Yandex Cloud Postbox API Client for Node.js

> **⚠️ Disclaimer:** This code is for demonstration purposes only and should **not
** be used in production environments. For production use, please use the official AWS SDK for secure, robust, and fully supported implementations.

A plain JavaScript client for sending emails through the Yandex Cloud Postbox API. This implementation uses only
standard JavaScript APIs (fetch, Web Crypto API) and requires no third-party dependencies.

## Features

- ✅ **Pure JavaScript** - No external dependencies, uses only standard Node.js APIs
- ✅ **AWS Signature V4** - Proper authentication implementation
- ✅ **Multiple Email Types** - Simple, Template, and Raw email support
- ✅ **Modern Async/Await** - Clean promise-based API
- ✅ **Node.js 18+** - Uses native Web Crypto API and fetch
- ✅ **Error Handling** - Comprehensive error handling with detailed messages
- ✅ **Input Validation** - Email address and required field validation
- ✅ **Retry Logic** - Exponential backoff with jitter for transient failures
- ✅ **Rate Limiting** - Client-side rate limiting protection
- ✅ **Request Timeout** - Configurable timeout with AbortController
- ✅ **Debug Logging** - Optional debug mode for troubleshooting
- ✅ **TypeScript Support** - Complete TypeScript definitions included

## Quick Start

### 1. Installation and Setup

```javascript
const PostboxClient = require('./main.js');

const client = new PostboxClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ru-central1', // Default: ru-central1
    host: 'postbox.cloud.yandex.net', // Default host
    timeout: 30000, // Request timeout in ms (default: 30000)
    maxRetries: 3, // Max retry attempts (default: 3)
    maxJitter: 1000, // Max retry jitter in ms (default: 1000)
    minRequestInterval: 100, // Min interval between requests in ms (default: 100)
    debug: false // Enable debug logging (default: false)
});
```

### 2. Send Simple Email

```javascript
try {
    const result = await client.sendSimpleEmail({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Hello World',
        textContent: 'This is a plain text email',
        htmlContent: '<h1>Hello World</h1><p>This is an HTML email</p>'
    });

    console.log('Email sent! Message ID:', result.MessageId);
} catch (error) {
    console.error('Failed to send email:', error.message);
}
```

### 3. Send Template Email

```javascript
const result = await client.sendTemplateEmail({
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    templateContent: {
        Subject: 'Welcome {{name}}!',
        Text: 'Hello {{name}}, welcome to {{company}}!',
        Html: '<h1>Hello {{name}}</h1><p>Welcome to {{company}}!</p>'
    },
    templateData: {
        name: 'John Doe',
        company: 'Acme Corp'
    }
});
```

### 4. Send Raw Email

```javascript
const result = await client.sendRawEmail({
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    rawData: 'base64_encoded_mime_message'
});
```

## API Reference

### Constructor Options

| Option               | Type    | Default                    | Description                             |
|----------------------|---------|----------------------------|-----------------------------------------|
| `accessKeyId`        | string  | required                   | Yandex Cloud access key ID              |
| `secretAccessKey`    | string  | required                   | Yandex Cloud secret access key          |
| `region`             | string  | `ru-central1`              | Yandex Cloud region                     |
| `host`               | string  | `postbox.cloud.yandex.net` | API endpoint host                       |
| `timeout`            | number  | `30000`                    | Request timeout in milliseconds         |
| `maxRetries`         | number  | `3`                        | Maximum retry attempts for failed requests |
| `maxJitter`          | number  | `1000`                     | Maximum jitter for retry backoff (ms)  |
| `minRequestInterval` | number  | `100`                      | Minimum interval between requests (ms)  |
| `debug`              | boolean | `false`                    | Enable debug logging                    |

### Simple Email Options

| Option                 | Type          | Required | Description                             |
|------------------------|---------------|----------|-----------------------------------------|
| `from`                 | string        | ✅        | Sender email address (must be verified) |
| `to`                   | string\|array | ✅        | Recipient email address(es)             |
| `subject`              | string        | ✅        | Email subject                           |
| `textContent`          | string        | ❌        | Plain text content                      |
| `htmlContent`          | string        | ❌        | HTML content                            |
| `cc`                   | array         | ❌        | CC recipients                           |
| `bcc`                  | array         | ❌        | BCC recipients                          |
| `configurationSetName` | string        | ❌        | Configuration set name                  |
| `customHeaders`        | array         | ❌        | Custom email headers                    |

### Template Email Options

| Option                 | Type          | Required | Description                               |
|------------------------|---------------|----------|-------------------------------------------|
| `from`                 | string        | ✅        | Sender email address                      |
| `to`                   | string\|array | ✅        | Recipient email address(es)               |
| `templateContent`      | object        | ✅        | Template content with Subject, Text, Html |
| `templateData`         | object        | ✅        | Data for template substitution            |
| `cc`                   | array         | ❌        | CC recipients                             |
| `bcc`                  | array         | ❌        | BCC recipients                            |
| `configurationSetName` | string        | ❌        | Configuration set name                    |
| `customHeaders`        | array         | ❌        | Custom email headers                      |

### Raw Email Options

| Option                 | Type          | Required | Description                   |
|------------------------|---------------|----------|-------------------------------|
| `from`                 | string        | ✅        | Sender email address          |
| `to`                   | string\|array | ✅        | Recipient email address(es)   |
| `rawData`              | string        | ✅        | Base64 encoded raw email data |
| `cc`                   | array         | ❌        | CC recipients                 |
| `bcc`                  | array         | ❌        | BCC recipients                |
| `configurationSetName` | string        | ❌        | Configuration set name        |

## Environment Variables

Set up your environment variables for secure credential management:

```bash
export AWS_ACCESS_KEY_ID="your_access_key_id"
export AWS_SECRET_ACCESS_KEY="your_secret_access_key"
```

Or create a `.env` file:

```bash
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

## Error Handling

The client throws descriptive errors for different scenarios:

```javascript
try {
    await client.sendSimpleEmail(options);
} catch (error) {
    if (error.message.includes('API Error')) {
        // API returned an error response (includes Request ID for debugging)
        console.error('API Error:', error.message);
        // Example: "API Error 403: Forbidden: Access denied (Request ID: abc123-def456)"
    } else if (error.message.includes('Network error')) {
        // Network/connectivity issue
        console.error('Network Error:', error.message);
    } else {
        // Other errors (validation, etc.)
        console.error('Error:', error.message);
    }
}
```

## Common API Errors

| Error Code                                   | Description                   |
|----------------------------------------------|-------------------------------|
| `BadRequestException`                        | Invalid request parameters    |
| `BadRequestException: sender is not allowed` | Sender not in allowed list    |
| `AccountSuspendedException`                  | Account suspended permanently |
| `SendingPausedException`                     | Account suspended temporarily |
| `MessageRejected`                            | Invalid email data            |
| `MailFromDomainNotVerifiedException`         | Sender address not verified   |
| `NotFoundException`                          | Resource not found            |
| `TooManyRequestsException`                   | Rate limit exceeded           |
| `LimitExceededException`                     | Quota exceeded                |

### HTTP Status Code Errors

| Status | Description           | Common Causes                                                  |
|--------|-----------------------|----------------------------------------------------------------|
| `400`  | Bad Request           | Invalid JSON, missing required fields                          |
| `401`  | Unauthorized          | Invalid access key or secret                                   |
| `403`  | Forbidden             | Credentials valid but lacking permissions, sender not verified |
| `404`  | Not Found             | Wrong API endpoint URL                                         |
| `429`  | Too Many Requests     | Rate limiting, slow down requests                              |
| `500`  | Internal Server Error | Temporary server issues                                        |

## Troubleshooting

### 403 Forbidden Error

This is the most common error when starting with Postbox API:

```text
API Error 403: Forbidden: Access denied - check your credentials and permissions (Request ID: abc123-def456-789xyz)
```

**Possible causes:**

1. **Sender email not verified** - Verify your sender domain/email in Yandex Cloud Console
2. **Wrong service account** - Ensure your access keys belong to the correct service account
3. **Missing IAM permissions** - Service account needs `postbox.editor` role or higher
4. **Invalid signature** - Check if your system clock is synchronized

💡 **Note:** All error messages include a Request ID for debugging purposes. Include this ID when contacting support.

## Requirements

- **Node.js**: Node.js 18.0+ (for native Web Crypto API and fetch support)
- **No additional dependencies** - Uses only built-in Node.js APIs

## Security Notes

⚠️ **Important Security Considerations:**

1. **Use environment variables** for storing access keys in production
2. **Never hardcode credentials** in your source code
3. **Implement proper access controls** in your application
4. **Verify sender addresses** in your Yandex Cloud Postbox configuration
5. **Use secure network connections** - API uses HTTPS by default

## Running the Example

1. Set your environment variables:

```bash
export AWS_ACCESS_KEY_ID="your_access_key_id"
export AWS_SECRET_ACCESS_KEY="your_secret_access_key"
```

2. Run the example:

```bash
node example.js
```

The example includes:

- ✅ Simple email sending
- ✅ Template email with variable substitution
- ✅ Email with CC and BCC recipients
- ✅ Error handling and validation

## Custom Usage

For your own projects, create a new file with your specific email logic:

```javascript
const PostboxClient = require('./main.js');

async function sendWelcomeEmail(userEmail, userName) {
    const client = new PostboxClient({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    try {
        const result = await client.sendSimpleEmail({
            from: 'noreply@yourcompany.com', // Your verified sender
            to: [userEmail],
            subject: `Welcome ${userName}!`,
            textContent: `Hello ${userName}, welcome to our platform!`,
            htmlContent: `<h1>Welcome ${userName}!</h1><p>Thanks for joining us.</p>`
        });

        console.log('✅ Welcome email sent!');
        return result.MessageId;
    } catch (error) {
        console.error('❌ Failed to send welcome email:', error.message);
        throw error;
    }
}

// Usage
sendWelcomeEmail('user@example.com', 'John Doe');
```

📋 **See `example.js` for comprehensive examples including template emails, CC/BCC, and error handling.**

## License

This implementation is provided as-is for educational and development purposes.
