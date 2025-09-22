/**
 * Yandex Cloud Postbox API Client for Node.js
 * A plain JavaScript client for sending emails through Yandex Cloud Postbox API
 * Uses AWS Signature Version 4 for authentication
 *
 * Requirements: Node.js 18+ (for native Web Crypto API support)
 */

// Constants
const DEFAULTS = {
  REGION: 'ru-central1',
  SERVICE: 'ses',
  HOST: 'postbox.cloud.yandex.net',
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY: 1000, // 1 second
  MAX_JITTER: 1000, // Maximum jitter in milliseconds
  MIN_REQUEST_INTERVAL: 100 // Minimum interval between requests in milliseconds
};

class PostboxClient {
  constructor(config) {
    if (!config) {
      throw new Error('Configuration object is required');
    }
    if (!config.accessKeyId || !config.secretAccessKey) {
      throw new Error('Missing required credentials: accessKeyId and secretAccessKey are required');
    }
    
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.region = config.region || DEFAULTS.REGION;
    this.service = DEFAULTS.SERVICE;
    this.host = config.host || DEFAULTS.HOST;
    this.endpoint = `https://${this.host}`;
    this.timeout = config.timeout || DEFAULTS.TIMEOUT;
    this.maxRetries = config.maxRetries || DEFAULTS.MAX_RETRIES;
    this.maxJitter = config.maxJitter || DEFAULTS.MAX_JITTER;
    this.debug = config.debug || false;
    
    // Rate limiting
    this.lastRequestTime = 0;
    this.minRequestInterval = config.minRequestInterval || DEFAULTS.MIN_REQUEST_INTERVAL;
  }

  /**
   * Validates an email address format
   * @private
   * @param {string} email - Email address to validate
   * @throws {Error} - If email format is invalid
   */
  _validateEmail(email) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email address must be a non-empty string');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email address format: ${email}`);
    }
  }

  /**
   * Validates an array of email addresses
   * @private
   * @param {string|string[]} emails - Email address(es) to validate
   * @returns {string[]} - Array of validated email addresses
   */
  _validateEmails(emails) {
    if (!emails) {
      throw new Error('Email addresses are required');
    }
    const emailArray = Array.isArray(emails) ? emails : [emails];
    if (emailArray.length === 0) {
      throw new Error('At least one email address is required');
    }
    emailArray.forEach(email => this._validateEmail(email));
    return emailArray;
  }

  /**
   * Logs debug information if debug mode is enabled
   * @private
   * @param {string} message - Debug message
   * @param {any} data - Optional data to log
   */
  _log(message, data) {
    if (this.debug) {
      console.log(`[PostboxClient] ${message}`, data || '');
    }
  }

  /**
   * Implements rate limiting by ensuring minimum interval between requests
   * @private
   */
  async _rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      this._log(`Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Implements retry logic with exponential backoff
   * @private
   * @param {Function} operation - Function to retry
   * @param {number} attempt - Current attempt number
   * @returns {Promise<any>} - Result of the operation
   */
  async _retryWithBackoff(operation, attempt = 1) {
    try {
      return await operation();
    } catch (error) {
      // Don't retry client errors (4xx) or final attempt
      if (attempt >= this.maxRetries || 
          (error.message.includes('API Error') && error.message.match(/API Error [4]\d\d/))) {
        throw error;
      }

      // Only retry on network errors or 5xx server errors
      const shouldRetry = error.message.includes('Network error') || 
                         error.message.includes('Internal Server Error') ||
                         error.message.includes('Service Unavailable') ||
                         error.message.includes('Timeout');
      
      if (!shouldRetry) {
        throw error;
      }

      const delay = DEFAULTS.INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1) + Math.random() * this.maxJitter;
      this._log(`Retry attempt ${attempt}/${this.maxRetries} after ${delay}ms`, { error: error.message });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this._retryWithBackoff(operation, attempt + 1);
    }
  }

  /**
   * Sends an email using the Postbox API with retry logic and rate limiting
   * @param {Object} emailData - Email configuration
   * @returns {Promise<Object>} - API response with MessageId
   */
  async sendEmail(emailData) {
    if (!emailData) {
      throw new Error('Email data is required');
    }

    await this._rateLimit();

    const operation = async () => {
      const url = `${this.endpoint}/v2/email/outbound-emails`;
      const method = 'POST';
      const payload = JSON.stringify(emailData);

      const headers = await this._getSignedHeaders(method, '/v2/email/outbound-emails', payload);

      this._log('Sending request', { url, headers: { ...headers, Authorization: '[REDACTED]' } });

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        this._log('Request timed out');
      }, this.timeout);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: payload,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle successful responses
        if (response.ok) {
          try {
            const result = await response.json();
            this._log('Request successful', { messageId: result.MessageId });
            return result;
          } catch (parseError) {
            const requestId = response.headers.get('x-request-id') ||
                             response.headers.get('x-amz-requestid') ||
                             response.headers.get('request-id') ||
                             'unknown';
            throw new Error(`Invalid JSON response from server (Request ID: ${requestId})`);
          }
        }

      // Handle error responses
      let errorMessage;
      let errorCode;

      // Extract request ID from response headers for debugging
      const requestId = response.headers.get('x-request-id') ||
                       response.headers.get('x-amz-requestid') ||
                       response.headers.get('request-id') ||
                       'unknown';

      // Read response body as text first to avoid "body already consumed" error
      const responseText = await response.text();

      // Try to parse as JSON first (standard API error format)
      try {
        const errorData = JSON.parse(responseText);
        errorCode = errorData.Code || 'Unknown';
        errorMessage = errorData.message || 'Unknown error';
      } catch (parseError) {
        // Fallback for non-JSON responses
        errorCode = response.status;

        // Provide better error messages for common HTTP status codes
        switch (response.status) {
          case 400:
            errorMessage = `Bad Request: ${responseText || 'Invalid request parameters'}`;
            break;
          case 401:
            errorMessage = `Unauthorized: ${responseText || 'Invalid credentials or authentication failed'}`;
            break;
          case 403:
            errorMessage = `Forbidden: ${responseText || 'Access denied - check your credentials and permissions'}`;
            break;
          case 404:
            errorMessage = `Not Found: ${responseText || 'API endpoint not found'}`;
            break;
          case 429:
            errorMessage = `Rate Limited: ${responseText || 'Too many requests'}`;
            break;
          case 500:
            errorMessage = `Internal Server Error: ${responseText || 'Server error'}`;
            break;
          default:
            errorMessage = `HTTP ${response.status}: ${responseText || 'Unknown server error'}`;
        }
      }

        throw new Error(`API Error ${errorCode}: ${errorMessage} (Request ID: ${requestId})`);
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Handle different error types
        if (error.message.startsWith('API Error')) {
          throw error;
        }
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
          throw new Error(`Network error: ${error.message}`);
        }
        throw error;
      }
    };

    return this._retryWithBackoff(operation);
  }

  /**
   * Sends a simple email with text and/or HTML content
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - API response
   */
  async sendSimpleEmail(options) {
    if (!options) {
      throw new Error('Email options are required');
    }

    const {
      from,
      to,
      cc = [],
      bcc = [],
      subject,
      textContent,
      htmlContent,
      configurationSetName,
      customHeaders = []
    } = options;

    // Validate required fields
    if (!from) {
      throw new Error('Sender email address (from) is required');
    }
    if (!to) {
      throw new Error('Recipient email address(es) (to) is required');
    }
    if (!subject) {
      throw new Error('Email subject is required');
    }
    if (!textContent && !htmlContent) {
      throw new Error('Either textContent or htmlContent is required');
    }

    // Validate email addresses
    this._validateEmail(from);
    const toAddresses = this._validateEmails(to);
    const ccAddresses = cc.length > 0 ? this._validateEmails(cc) : [];
    const bccAddresses = bcc.length > 0 ? this._validateEmails(bcc) : [];

    const emailData = {
      FromEmailAddress: from,
      Destination: {
        ToAddresses: toAddresses,
        ...(ccAddresses.length > 0 && { CcAddresses: ccAddresses }),
        ...(bccAddresses.length > 0 && { BccAddresses: bccAddresses })
      },
      Content: {
        Simple: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          },
          ...(customHeaders.length > 0 && { Headers: customHeaders }),
          Body: {}
        }
      },
      ...(configurationSetName && { ConfigurationSetName: configurationSetName })
    };

    if (textContent) {
      emailData.Content.Simple.Body.Text = {
        Data: textContent,
        Charset: 'UTF-8'
      };
    }

    if (htmlContent) {
      emailData.Content.Simple.Body.Html = {
        Data: htmlContent,
        Charset: 'UTF-8'
      };
    }

    return this.sendEmail(emailData);
  }

  /**
   * Sends an email using a template
   * @param {Object} options - Template email options
   * @returns {Promise<Object>} - API response
   */
  async sendTemplateEmail(options) {
    if (!options) {
      throw new Error('Template email options are required');
    }

    const {
      from,
      to,
      cc = [],
      bcc = [],
      templateContent,
      templateData = {},
      configurationSetName,
      customHeaders = []
    } = options;

    // Validate required fields
    if (!from) {
      throw new Error('Sender email address (from) is required');
    }
    if (!to) {
      throw new Error('Recipient email address(es) (to) is required');
    }
    if (!templateContent) {
      throw new Error('Template content is required');
    }
    if (typeof templateContent !== 'object') {
      throw new Error('Template content must be an object');
    }

    // Validate email addresses
    this._validateEmail(from);
    const toAddresses = this._validateEmails(to);
    const ccAddresses = cc.length > 0 ? this._validateEmails(cc) : [];
    const bccAddresses = bcc.length > 0 ? this._validateEmails(bcc) : [];

    const emailData = {
      FromEmailAddress: from,
      Destination: {
        ToAddresses: toAddresses,
        ...(ccAddresses.length > 0 && { CcAddresses: ccAddresses }),
        ...(bccAddresses.length > 0 && { BccAddresses: bccAddresses })
      },
      Content: {
        Template: {
          ...(customHeaders.length > 0 && { Headers: customHeaders }),
          TemplateContent: templateContent,
          TemplateData: JSON.stringify(templateData)
        }
      },
      ...(configurationSetName && { ConfigurationSetName: configurationSetName })
    };

    return this.sendEmail(emailData);
  }

  /**
   * Sends a raw email
   * @param {Object} options - Raw email options
   * @returns {Promise<Object>} - API response
   */
  async sendRawEmail(options) {
    if (!options) {
      throw new Error('Raw email options are required');
    }

    const {
      from,
      to,
      cc = [],
      bcc = [],
      rawData,
      configurationSetName
    } = options;

    // Validate required fields
    if (!from) {
      throw new Error('Sender email address (from) is required');
    }
    if (!to) {
      throw new Error('Recipient email address(es) (to) is required');
    }
    if (!rawData) {
      throw new Error('Raw email data is required');
    }
    if (typeof rawData !== 'string') {
      throw new Error('Raw email data must be a string');
    }

    // Validate email addresses
    this._validateEmail(from);
    const toAddresses = this._validateEmails(to);
    const ccAddresses = cc.length > 0 ? this._validateEmails(cc) : [];
    const bccAddresses = bcc.length > 0 ? this._validateEmails(bcc) : [];

    const emailData = {
      FromEmailAddress: from,
      Destination: {
        ToAddresses: toAddresses,
        ...(ccAddresses.length > 0 && { CcAddresses: ccAddresses }),
        ...(bccAddresses.length > 0 && { BccAddresses: bccAddresses })
      },
      Content: {
        Raw: {
          Data: rawData
        }
      },
      ...(configurationSetName && { ConfigurationSetName: configurationSetName })
    };

    return this.sendEmail(emailData);
  }

  /**
   * Generates signed headers for AWS Signature Version 4
   * @private
   */
  async _getSignedHeaders(method, uri, payload = '') {
    const now = new Date();
    const amzDate = this._getAmzDate(now);
    const dateStamp = this._getDateStamp(now);

    const headers = {
      'Content-Type': 'application/json',
      'Host': this.host,
      'X-Amz-Date': amzDate
    };

    const hashedPayload = await this._sha256Hex(payload);
    const canonicalRequest = this._createCanonicalRequest(method, uri, headers, hashedPayload);
    const stringToSign = await this._createStringToSign(amzDate, dateStamp, canonicalRequest);
    const signingKey = await this._createSigningKey(dateStamp);
    const signature = await this._calculateSignature(signingKey, stringToSign);

    const signedHeaders = Object.keys(headers)
      .map(key => key.toLowerCase())
      .sort()
      .join(';');

    headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${dateStamp}/${this.region}/${this.service}/aws4_request, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return headers;
  }

  /**
   * Creates canonical request for AWS Signature V4
   * @private
   */
  _createCanonicalRequest(method, uri, headers, hashedPayload) {
    const canonicalHeaders = Object.keys(headers)
      .map(key => `${key.toLowerCase()}:${headers[key]}`)
      .sort()
      .join('\n') + '\n';

    const signedHeaders = Object.keys(headers)
      .map(key => key.toLowerCase())
      .sort()
      .join(';');

    return [
      method,
      uri,
      '', // CanonicalQueryString (empty for POST requests)
      canonicalHeaders,
      signedHeaders,
      hashedPayload
    ].join('\n');
  }

  /**
   * Creates string to sign for AWS Signature V4
   * @private
   */
  async _createStringToSign(amzDate, dateStamp, canonicalRequest) {
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${this.region}/${this.service}/aws4_request`;
    const hashedCanonicalRequest = await this._sha256Hex(canonicalRequest);

    return [
      algorithm,
      amzDate,
      credentialScope,
      hashedCanonicalRequest
    ].join('\n');
  }

  /**
   * Creates signing key for AWS Signature V4
   * @private
   */
  async _createSigningKey(dateStamp) {
    const kDate = await this._hmacSha256(`AWS4${this.secretAccessKey}`, dateStamp);
    const kRegion = await this._hmacSha256(kDate, this.region);
    const kService = await this._hmacSha256(kRegion, this.service);
    const kSigning = await this._hmacSha256(kService, 'aws4_request');
    return kSigning;
  }

  /**
   * Calculates final signature
   * @private
   */
  async _calculateSignature(signingKey, stringToSign) {
    const signature = await this._hmacSha256(signingKey, stringToSign);
    return this._arrayBufferToHex(signature);
  }

  /**
   * HMAC-SHA256 implementation using Web Crypto API
   * @private
   */
  async _hmacSha256(key, data) {
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      typeof key === 'string' ? encoder.encode(key) : key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    return await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  }

  /**
   * SHA256 hash in hex format
   * @private
   */
  async _sha256Hex(data) {
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return this._arrayBufferToHex(hash);
  }

  /**
   * Convert ArrayBuffer to hex string
   * @private
   */
  _arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Get AMZ date format (ISO 8601)
   * @private
   */
  _getAmzDate(date) {
    return date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  }

  /**
   * Get date stamp (YYYYMMDD)
   * @private
   */
  _getDateStamp(date) {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }
}

// Export the PostboxClient class
module.exports = PostboxClient;
