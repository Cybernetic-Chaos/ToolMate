export interface IChat {
  role: string;
  message: string;
  expression?: string;
}

export type IMateyExpression =
  | "laugh"
  | "hello"
  | "smile"
  | "offer"
  | "1thumb"
  | "2thumb"
  | "tool"
  | "thinking";


export interface ExpressionData {
  kwargs: {
    content: string;
  };
}

export interface ChatItem {
  sessionId: string;
  chatName: string;
  id: string;
}
export interface iChatname {
  dateDiff: string;
  data: ChatItem[]
}

export interface ICommunityForm {
  name: string;
  description: string;
  profileImage: string;
  bannerImage?: string;
  profileImageParams: string;
  bannerImageParams?: string;
}

export interface ProductItem {
  catagoryName: string;
  products: any[]
}

export interface RefundLog {
  id: string
  status: string
  amount: string
  createdAt: string
  seller_payable_breakdown: {
    gross_amount: {
      currency_code: string
      value: string
    }
    paypal_fee: {
      currency_code: string
      value: string
    }
    net_amount: {
      currency_code: string
      value: string
    }
    total_refunded_amount: {
      currency_code: string
      value: string
    }
  }
}

export interface TransationLogs {
  id: string;
  status: string;
  time: string;
  amount_with_breakdown: {
    gross_amount: {
      currency_code: string;
      value: string;
    };
    fee_amount: {
      currency_code: string;
      value: string;
    };
    net_amount: {
      currency_code: string;
      value: string;
    };
  };

}


export interface IBunningProduct {
  itemNumber: string;
  title: string;
  description: string;
  brand: string;
  leadingBrand: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  heroImage: string;
  otherImages: string[];
  keySellingPoints: string[];
  microSellingPoints: string[];
  price: {
    itemNumber: string;
    unitPrice: number;
    lineUnitPrice: number;
  };
  url: string;
}

export interface VendorProduct {
  name: string;
  description: string;
  price: string;
  link: string;
  imageParams: string[];
}


export interface IBunningsFilter {
  brands: string[];
  price: [number, number];
  isTopBrand: boolean
  newArrival: boolean
  bestSeller: boolean
}