// src/types/africastalking.d.ts
declare module 'africastalking' {
  interface SMSOptions {
    to: string | string[];
    message: string;
    from?: string;
    bulkSMSMode?: boolean;
    enqueue?: boolean;
    keyword?: string;
    linkId?: string;
    retryDurationInHours?: number;
  }

  interface SMSResponse {
    SMSMessageData: {
      Message: string;
      Recipients: Array<{
        number: string;
        status: string;
        cost: string;
        messageId: string;
        statusCode?: number;
      }>;
    };
  }

  interface AfricasTalking {
    SMS: {
      send(options: SMSOptions): Promise<SMSResponse>;
    };
  }

  function africastalking(options: {
    apiKey: string;
    username: string;
  }): AfricasTalking;

  export = africastalking;
}