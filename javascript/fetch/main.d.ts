/**
 * TypeScript definitions for Yandex Cloud Postbox API Client
 */

export interface PostboxClientConfig {
  /** Yandex Cloud access key ID */
  accessKeyId: string;
  /** Yandex Cloud secret access key */
  secretAccessKey: string;
  /** Yandex Cloud region (default: 'ru-central1') */
  region?: string;
  /** API endpoint host (default: 'postbox.cloud.yandex.net') */
  host?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Maximum jitter for retry backoff in milliseconds (default: 1000) */
  maxJitter?: number;
  /** Minimum interval between requests in milliseconds (default: 100) */
  minRequestInterval?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

export interface EmailAddress {
  /** Email address string */
  email: string;
  /** Optional display name */
  name?: string;
}

export interface CustomHeader {
  /** Header name */
  name: string;
  /** Header value */
  value: string;
}

export interface SimpleEmailOptions {
  /** Sender email address (must be verified) */
  from: string;
  /** Recipient email address(es) */
  to: string | string[];
  /** Email subject */
  subject: string;
  /** Plain text content */
  textContent?: string;
  /** HTML content */
  htmlContent?: string;
  /** CC recipients */
  cc?: string[];
  /** BCC recipients */
  bcc?: string[];
  /** Configuration set name */
  configurationSetName?: string;
  /** Custom email headers */
  customHeaders?: CustomHeader[];
}

export interface TemplateContent {
  /** Email subject template */
  Subject?: string;
  /** Plain text template */
  Text?: string;
  /** HTML template */
  Html?: string;
}

export interface TemplateEmailOptions {
  /** Sender email address (must be verified) */
  from: string;
  /** Recipient email address(es) */
  to: string | string[];
  /** Template content with Subject, Text, Html */
  templateContent: TemplateContent;
  /** Data for template substitution */
  templateData?: Record<string, any>;
  /** CC recipients */
  cc?: string[];
  /** BCC recipients */
  bcc?: string[];
  /** Configuration set name */
  configurationSetName?: string;
  /** Custom email headers */
  customHeaders?: CustomHeader[];
}

export interface RawEmailOptions {
  /** Sender email address (must be verified) */
  from: string;
  /** Recipient email address(es) */
  to: string | string[];
  /** Base64 encoded raw email data */
  rawData: string;
  /** CC recipients */
  cc?: string[];
  /** BCC recipients */
  bcc?: string[];
  /** Configuration set name */
  configurationSetName?: string;
}

export interface EmailResponse {
  /** Unique message identifier */
  MessageId: string;
}

export interface EmailData {
  /** Sender email address */
  FromEmailAddress: string;
  /** Email destination */
  Destination: {
    /** Primary recipients */
    ToAddresses: string[];
    /** CC recipients */
    CcAddresses?: string[];
    /** BCC recipients */
    BccAddresses?: string[];
  };
  /** Email content */
  Content: {
    /** Simple email content */
    Simple?: {
      /** Email subject */
      Subject: {
        Data: string;
        Charset: string;
      };
      /** Email body */
      Body: {
        /** Plain text content */
        Text?: {
          Data: string;
          Charset: string;
        };
        /** HTML content */
        Html?: {
          Data: string;
          Charset: string;
        };
      };
      /** Custom headers */
      Headers?: CustomHeader[];
    };
    /** Template email content */
    Template?: {
      /** Template content */
      TemplateContent: TemplateContent;
      /** Template data as JSON string */
      TemplateData: string;
      /** Custom headers */
      Headers?: CustomHeader[];
    };
    /** Raw email content */
    Raw?: {
      /** Raw email data */
      Data: string;
    };
  };
  /** Configuration set name */
  ConfigurationSetName?: string;
}

/**
 * Yandex Cloud Postbox API Client
 */
export default class PostboxClient {
  /** Access key ID */
  public readonly accessKeyId: string;
  /** Secret access key */
  public readonly secretAccessKey: string;
  /** Region */
  public readonly region: string;
  /** Service name */
  public readonly service: string;
  /** Host */
  public readonly host: string;
  /** API endpoint */
  public readonly endpoint: string;
  /** Request timeout */
  public readonly timeout: number;
  /** Max retries */
  public readonly maxRetries: number;
  /** Maximum jitter for retry backoff */
  public readonly maxJitter: number;
  /** Minimum interval between requests */
  public readonly minRequestInterval: number;
  /** Debug mode */
  public readonly debug: boolean;

  /**
   * Creates a new PostboxClient instance
   * @param config - Client configuration
   */
  constructor(config: PostboxClientConfig);

  /**
   * Sends an email using the Postbox API with retry logic and rate limiting
   * @param emailData - Email configuration
   * @returns Promise resolving to API response with MessageId
   */
  sendEmail(emailData: EmailData): Promise<EmailResponse>;

  /**
   * Sends a simple email with text and/or HTML content
   * @param options - Email options
   * @returns Promise resolving to API response
   */
  sendSimpleEmail(options: SimpleEmailOptions): Promise<EmailResponse>;

  /**
   * Sends an email using a template
   * @param options - Template email options
   * @returns Promise resolving to API response
   */
  sendTemplateEmail(options: TemplateEmailOptions): Promise<EmailResponse>;

  /**
   * Sends a raw email
   * @param options - Raw email options
   * @returns Promise resolving to API response
   */
  sendRawEmail(options: RawEmailOptions): Promise<EmailResponse>;

  /**
   * Validates an email address format
   * @private
   */
  private _validateEmail(email: string): void;

  /**
   * Validates an array of email addresses
   * @private
   */
  private _validateEmails(emails: string | string[]): string[];

  /**
   * Logs debug information if debug mode is enabled
   * @private
   */
  private _log(message: string, data?: any): void;

  /**
   * Implements rate limiting by ensuring minimum interval between requests
   * @private
   */
  private _rateLimit(): Promise<void>;

  /**
   * Implements retry logic with exponential backoff
   * @private
   */
  private _retryWithBackoff<T>(operation: () => Promise<T>, attempt?: number): Promise<T>;

  /**
   * Generates signed headers for AWS Signature Version 4
   * @private
   */
  private _getSignedHeaders(method: string, uri: string, payload?: string): Promise<Record<string, string>>;

  /**
   * Creates canonical request for AWS Signature V4
   * @private
   */
  private _createCanonicalRequest(method: string, uri: string, headers: Record<string, string>, hashedPayload: string): string;

  /**
   * Creates string to sign for AWS Signature V4
   * @private
   */
  private _createStringToSign(amzDate: string, dateStamp: string, canonicalRequest: string): Promise<string>;

  /**
   * Creates signing key for AWS Signature V4
   * @private
   */
  private _createSigningKey(dateStamp: string): Promise<ArrayBuffer>;

  /**
   * Calculates final signature
   * @private
   */
  private _calculateSignature(signingKey: ArrayBuffer, stringToSign: string): Promise<string>;

  /**
   * HMAC-SHA256 implementation using Web Crypto API
   * @private
   */
  private _hmacSha256(key: string | ArrayBuffer, data: string): Promise<ArrayBuffer>;

  /**
   * SHA256 hash in hex format
   * @private
   */
  private _sha256Hex(data: string): Promise<string>;

  /**
   * Convert ArrayBuffer to hex string
   * @private
   */
  private _arrayBufferToHex(buffer: ArrayBuffer): string;

  /**
   * Get AMZ date format (ISO 8601)
   * @private
   */
  private _getAmzDate(date: Date): string;

  /**
   * Get date stamp (YYYYMMDD)
   * @private
   */
  private _getDateStamp(date: Date): string;
}
