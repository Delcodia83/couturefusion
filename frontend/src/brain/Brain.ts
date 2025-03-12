import {
  CheckHealthData,
  CheckStatusData,
  CreatePaymentData,
  CreatePaymentError,
  CreatePaymentRequest,
  FirebaseInfoRequest,
  GenerateSignatureData,
  GenerateSignatureError,
  GenerateSignatureRequest,
  GetOrderPaymentStatusData,
  GetOrderPaymentStatusError,
  GetOrderPaymentStatusParams,
  GetSubscriptionPlansData,
  GetSubscriptionStatusData,
  GetSubscriptionStatusError,
  GetSubscriptionStatusParams,
  PaymentWebhookData,
  PaymentWebhookError,
  PaymentWebhookPayload,
  TestFirebaseData,
  TestFirebaseError,
  UpdateOrderPaymentStatusData,
  UpdateOrderPaymentStatusError,
  UpdateOrderPaymentStatusRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Test Firebase connection and provide info about config and rules
   *
   * @tags dbtn/module:firebase_test, dbtn/hasAuth
   * @name test_firebase
   * @summary Test Firebase
   * @request POST:/routes/test-firebase
   */
  test_firebase = (data: FirebaseInfoRequest, params: RequestParams = {}) =>
    this.request<TestFirebaseData, TestFirebaseError>({
      path: `/routes/test-firebase`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Vérifier la configuration et le statut de Cloudinary
   *
   * @tags dbtn/module:cloudinary, dbtn/hasAuth
   * @name check_status
   * @summary Check Status
   * @request GET:/routes/status
   */
  check_status = (params: RequestParams = {}) =>
    this.request<CheckStatusData, any>({
      path: `/routes/status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Générer une signature pour l'upload sécurisé côté client
   *
   * @tags dbtn/module:cloudinary, dbtn/hasAuth
   * @name generate_signature
   * @summary Generate Signature
   * @request POST:/routes/generate-signature
   */
  generate_signature = (data: GenerateSignatureRequest, params: RequestParams = {}) =>
    this.request<GenerateSignatureData, GenerateSignatureError>({
      path: `/routes/generate-signature`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Obtenir la liste des plans d'abonnement disponibles
   *
   * @tags dbtn/module:payment, dbtn/hasAuth
   * @name get_subscription_plans
   * @summary Get Subscription Plans
   * @request GET:/routes/plans
   */
  get_subscription_plans = (params: RequestParams = {}) =>
    this.request<GetSubscriptionPlansData, any>({
      path: `/routes/plans`,
      method: "GET",
      ...params,
    });

  /**
   * @description Créer une demande de paiement pour un abonnement via Paytech
   *
   * @tags dbtn/module:payment, dbtn/hasAuth
   * @name create_payment
   * @summary Create Payment
   * @request POST:/routes/create-payment
   */
  create_payment = (data: CreatePaymentRequest, params: RequestParams = {}) =>
    this.request<CreatePaymentData, CreatePaymentError>({
      path: `/routes/create-payment`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Obtenir le statut d'abonnement actuel d'un utilisateur
   *
   * @tags dbtn/module:payment, dbtn/hasAuth
   * @name get_subscription_status
   * @summary Get Subscription Status
   * @request GET:/routes/subscription-status/{user_id}
   */
  get_subscription_status = ({ userId, ...query }: GetSubscriptionStatusParams, params: RequestParams = {}) =>
    this.request<GetSubscriptionStatusData, GetSubscriptionStatusError>({
      path: `/routes/subscription-status/${userId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Webhook pour recevoir les confirmations de paiement de Paytech
   *
   * @tags dbtn/module:payment, dbtn/hasAuth
   * @name payment_webhook
   * @summary Payment Webhook
   * @request POST:/routes/webhook
   */
  payment_webhook = (data: PaymentWebhookPayload, params: RequestParams = {}) =>
    this.request<PaymentWebhookData, PaymentWebhookError>({
      path: `/routes/webhook`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Permettre aux tailleurs de marquer un paiement comme reçu pour une commande
   *
   * @tags dbtn/module:payment, dbtn/hasAuth
   * @name update_order_payment_status
   * @summary Update Order Payment Status
   * @request POST:/routes/order/update-payment-status
   */
  update_order_payment_status = (data: UpdateOrderPaymentStatusRequest, params: RequestParams = {}) =>
    this.request<UpdateOrderPaymentStatusData, UpdateOrderPaymentStatusError>({
      path: `/routes/order/update-payment-status`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Obtenir le statut de paiement d'une commande
   *
   * @tags dbtn/module:payment, dbtn/hasAuth
   * @name get_order_payment_status
   * @summary Get Order Payment Status
   * @request GET:/routes/order/payment-status/{order_id}
   */
  get_order_payment_status = ({ orderId, ...query }: GetOrderPaymentStatusParams, params: RequestParams = {}) =>
    this.request<GetOrderPaymentStatusData, GetOrderPaymentStatusError>({
      path: `/routes/order/payment-status/${orderId}`,
      method: "GET",
      query: query,
      ...params,
    });
}
