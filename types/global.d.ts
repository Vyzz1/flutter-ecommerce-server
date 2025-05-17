interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  fullAddress: string;
}

interface UpdateInformationRequest {
  fullName: string;
  avatar: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
}

interface ForgotPasswordRequest {
  email: string;
  password: string;
  token: string;
  otp: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface CategoryRequest {
  name: string;
  image: string;
}

interface AddressRequest {
  fullAddress: string;
  fullName: string;
  phoneNumber: string;
}

interface Attribute {
  attributeId: number | string; // id of attribute
  value: string; //
}

interface Variant {
  id?: string;
  attributes: Attribute[];
  price: number;
  stock: number;
  basePrice: number;
  discount: number;
  images: string[];
}

interface ProductRequest {
  name: string;
  description: string;
  categoryId: string;
  variants: Variant[];
  images: string[];
  attributes: string[];
  minPrice: number;
  minDiscount: number;
  brandId: string;
}

interface ShoppingCartRequest {
  variantId: number;
  quantity: number;
  id?: string;
}

interface CouponRequest {
  id?: string;

  code: string;
  discount: number;

  count: number;

  limit: number;
}

interface RatingRequest {
  variantId: string;
  images: string[];
  rating: number;
  review: string;
  orderDetailsId: string;
}

interface CommentRequest {
  content: string;
  productId: string;
  userId?: string;
  guestInfo?: {
    name: string;
    email: string;
  };
  replyTo: string;
}

type OrderDetailsRequest = {
  variantId: number;
  quantity: number;
  productName: string;
  attributes: [
    {
      name: string;
      value: string;
    }
  ];
};

type OrderRequest = {
  totalAmount: number;
  discountCode: string;
  shippingFee: number;
  address: AddressRequest;
  subTotal: number;
  loyaltyPoint: number;
  details: Array<OrderDetailsRequest>;
};

type OrderRequestAnonymous = OrderRequest & {
  email: string;
};

type ProductFilterRequest = {
  page?: number;
  limit?: number;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  categories?: string[];
  rating?: "BELOW_3" | "3_TO_4" | "4_TO_5";
  keyword?: string;
} & PaginationRequest;

type PaginationRequest = {
  page: number;
  limit: number;
  sortBy?: string;
  sortType?: string;
};
type GetOrderRequest = {
  fromDate?: string;
  toDate?: string;
  status?: string;
  search?: string;
} & PaginationRequest;

type StatsRequest = {
  fromDate: string;
  toDate: string;
};

type ChartCompareRequest = {
  groupBy: string;
} & StatsRequest;
