import axios, { AxiosResponse } from "axios";

const chapaInstance = axios.create({
  baseURL: "https://api.chapa.co/v1",
  headers: {
    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export interface ChapaInitPayload {
  amount: number | string;
  currency?: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization?: Record<string, any>;
}

export interface ChapaInitResponse {
  status: string;
  message: string;
  data: {
    checkout_url: string;
    [key: string]: any;
  };
}

export async function initializePayment(payload: ChapaInitPayload): Promise<ChapaInitResponse> {
  const data = {
    ...payload,
    currency: payload.currency || "ETB",
  };
  try {
    const response: AxiosResponse<ChapaInitResponse> = await chapaInstance.post(
      "/transaction/initialize",
      data
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Chapa API Error:", error.response.data);
      throw new Error(`Chapa API Error: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error("No response received from Chapa API:", error.request);
      throw new Error("No response received from Chapa API.");
    } else {
      console.error("Error in setting up Chapa API request:", error.message);
      throw new Error(`Error in setting up Chapa API request: ${error.message}`);
    }
  }
}

export async function verifyPayment(tx_ref: string): Promise<any> {
  try {
    const response = await chapaInstance.get(`/transaction/verify/${tx_ref}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Chapa API Error:", error.response.data);
      throw new Error(`Chapa API Error: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error("No response received from Chapa API:", error.request);
      throw new Error("No response received from Chapa API.");
    } else {
      console.error("Error in setting up Chapa API request:", error.message);
      throw new Error(`Error in setting up Chapa API request: ${error.message}`);
    }
  }
}

export async function transferToBank({
  account_name,
  account_number,
  amount,
  reference,
  bank_code,
  currency = "ETB",
}: {
  account_name: string;
  account_number: string;
  amount: number;
  reference: string;
  bank_code: string;
  currency?: string;
}): Promise<any> {
  try {
    const response = await chapaInstance.post("/transfer", {
      account_name,
      account_number,
      amount,
      reference,
      bank_code,
      currency,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Chapa API Error:", error.response.data);
      throw new Error(`Chapa API Error: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error("No response received from Chapa API:", error.request);
      throw new Error("No response received from Chapa API.");
    } else {
      console.error("Error in setting up Chapa API request:", error.message);
      throw new Error(`Error in setting up Chapa API request: ${error.message}`);
    }
  }
}
