import {
  CheckHealthData,
  CheckStatusData,
  CreatePaymentData,
  CreatePaymentRequest,
  FirebaseInfoRequest,
  GenerateSignatureData,
  GenerateSignatureRequest,
  GetOrderPaymentStatusData,
  GetSubscriptionPlansData,
  GetSubscriptionStatusData,
  PaymentWebhookData,
  PaymentWebhookPayload,
  TestFirebaseData,
  UpdateOrderPaymentStatusData,
  UpdateOrderPaymentStatusRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Test Firebase connection and provide info about config and rules
   * @tags dbtn/module:firebase_test, dbtn/hasAuth
   * @name test_firebase
   * @summary Test Firebase
   * @request POST:/routes/test-firebase
   */
  export namespace test_firebase {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FirebaseInfoRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TestFirebaseData;
  }

  /**
   * @description Vérifier la configuration et le statut de Cloudinary
   * @tags dbtn/module:cloudinary, dbtn/hasAuth
   * @name check_status
   * @summary Check Status
   * @request GET:/routes/status
   */
  export namespace check_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckStatusData;
  }

  /**
   * @description Générer une signature pour l'upload sécurisé côté client
   * @tags dbtn/module:cloudinary, dbtn/hasAuth
   * @name generate_signature
   * @summary Generate Signature
   * @request POST:/routes/generate-signature
   */
  export namespace generate_signature {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GenerateSignatureRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateSignatureData;
  }

  /**
   * @description Obtenir la liste des plans d'abonnement disponibles
   * @tags dbtn/module:payment, dbtn/hasAuth
   * @name get_subscription_plans
   * @summary Get Subscription Plans
   * @request GET:/routes/plans
   */
  export namespace get_subscription_plans {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSubscriptionPlansData;
  }

  /**
   * @description Créer une demande de paiement pour un abonnement via Paytech
   * @tags dbtn/module:payment, dbtn/hasAuth
   * @name create_payment
   * @summary Create Payment
   * @request POST:/routes/create-payment
   */
  export namespace create_payment {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreatePaymentRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreatePaymentData;
  }

  /**
   * @description Obtenir le statut d'abonnement actuel d'un utilisateur
   * @tags dbtn/module:payment, dbtn/hasAuth
   * @name get_subscription_status
   * @summary Get Subscription Status
   * @request GET:/routes/subscription-status/{user_id}
   */
  export namespace get_subscription_status {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSubscriptionStatusData;
  }

  /**
   * @description Webhook pour recevoir les confirmations de paiement de Paytech
   * @tags dbtn/module:payment, dbtn/hasAuth
   * @name payment_webhook
   * @summary Payment Webhook
   * @request POST:/routes/webhook
   */
  export namespace payment_webhook {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PaymentWebhookPayload;
    export type RequestHeaders = {};
    export type ResponseBody = PaymentWebhookData;
  }

  /**
   * @description Permettre aux tailleurs de marquer un paiement comme reçu pour une commande
   * @tags dbtn/module:payment, dbtn/hasAuth
   * @name update_order_payment_status
   * @summary Update Order Payment Status
   * @request POST:/routes/order/update-payment-status
   */
  export namespace update_order_payment_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateOrderPaymentStatusRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateOrderPaymentStatusData;
  }

  /**
   * @description Obtenir le statut de paiement d'une commande
   * @tags dbtn/module:payment, dbtn/hasAuth
   * @name get_order_payment_status
   * @summary Get Order Payment Status
   * @request GET:/routes/order/payment-status/{order_id}
   */
  export namespace get_order_payment_status {
    export type RequestParams = {
      /** Order Id */
      orderId: string;
    };
    export type RequestQuery = {
      /** Client Id */
      client_id: string;
      /** Tailor Id */
      tailor_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetOrderPaymentStatusData;
  }
}
