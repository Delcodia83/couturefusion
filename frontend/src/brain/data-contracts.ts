/** CloudinaryStatusResponse */
export interface CloudinaryStatusResponse {
  /** Status */
  status: string;
  /** Message */
  message: string;
}

/** CreatePaymentRequest */
export interface CreatePaymentRequest {
  /** User Id */
  user_id: string;
  /** Plan Id */
  plan_id: string;
  /**
   * Payment Method
   * @default "paytech"
   */
  payment_method?: string;
  /** Return Url */
  return_url?: string | null;
  /** Cancel Url */
  cancel_url?: string | null;
}

/** CreatePaymentResponse */
export interface CreatePaymentResponse {
  /** Payment Id */
  payment_id: string;
  /** Redirect Url */
  redirect_url: string;
  /** Status */
  status: string;
  /** Message */
  message: string;
}

/** FirebaseInfoRequest */
export interface FirebaseInfoRequest {
  /** Email */
  email: string;
  /** Password */
  password: string;
}

/** FirebaseInfoResponse */
export interface FirebaseInfoResponse {
  /** Connection Test */
  connection_test: boolean;
  /**
   * Error Message
   * @default ""
   */
  error_message?: string;
  /**
   * Firebase Config
   * @default {}
   */
  firebase_config?: object;
  /**
   * Firestore Rules
   * @default ""
   */
  firestore_rules?: string;
  /**
   * Recommendations
   * @default ""
   */
  recommendations?: string;
}

/** GenerateSignatureRequest */
export interface GenerateSignatureRequest {
  /** Folder */
  folder: string;
  /** Public Id */
  public_id?: string;
}

/** GenerateSignatureResponse */
export interface GenerateSignatureResponse {
  /** Signature */
  signature: string;
  /** Timestamp */
  timestamp: number;
  /** Cloud Name */
  cloud_name: string;
  /** Api Key */
  api_key: string;
  /** Folder */
  folder: string;
  /** Public Id */
  public_id?: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** OrderPaymentStatusResponse */
export interface OrderPaymentStatusResponse {
  /** Order Id */
  order_id: string;
  /** Status */
  status: string;
  /** Client Id */
  client_id: string;
  /** Tailor Id */
  tailor_id: string;
  /** Payment Received */
  payment_received: boolean;
  /** Payment Amount */
  payment_amount?: number | null;
  /** Payment Date */
  payment_date?: string | null;
  /** Payment Note */
  payment_note?: string | null;
}

/** SubscriptionPlan */
export interface SubscriptionPlan {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Price */
  price: number;
  /**
   * Currency
   * @default "XOF"
   */
  currency?: string;
  /** Duration Days */
  duration_days: number;
  /** Features */
  features: string[];
}

/** UpdateOrderPaymentStatusRequest */
export interface UpdateOrderPaymentStatusRequest {
  /** Order Id */
  order_id: string;
  /** Client Id */
  client_id: string;
  /** Tailor Id */
  tailor_id: string;
  /** Payment Received */
  payment_received: boolean;
  /** Payment Amount */
  payment_amount: number;
  /** Payment Note */
  payment_note?: string | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export type TestFirebaseData = FirebaseInfoResponse;

export type TestFirebaseError = HTTPValidationError;

export type CheckStatusData = CloudinaryStatusResponse;

export type GenerateSignatureData = GenerateSignatureResponse;

export type GenerateSignatureError = HTTPValidationError;

/** Response Get Subscription Plans */
export type GetSubscriptionPlansData = SubscriptionPlan[];

export type CreatePaymentData = CreatePaymentResponse;

export type CreatePaymentError = HTTPValidationError;

export interface GetSubscriptionStatusParams {
  /** User Id */
  userId: string;
}

export type GetSubscriptionStatusData = any;

export type GetSubscriptionStatusError = HTTPValidationError;

/** Payload */
export type PaymentWebhookPayload = object;

export type PaymentWebhookData = any;

export type PaymentWebhookError = HTTPValidationError;

export type UpdateOrderPaymentStatusData = OrderPaymentStatusResponse;

export type UpdateOrderPaymentStatusError = HTTPValidationError;

export interface GetOrderPaymentStatusParams {
  /** Client Id */
  client_id: string;
  /** Tailor Id */
  tailor_id: string;
  /** Order Id */
  orderId: string;
}

export type GetOrderPaymentStatusData = OrderPaymentStatusResponse;

export type GetOrderPaymentStatusError = HTTPValidationError;
