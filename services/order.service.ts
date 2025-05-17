import ArgumentError from "../errors/AgrumentError";
import Coupon from "../models/coupon.model";
import Order from "../models/order.model";
import OrderDetails from "../models/orderDetails.model";
import OrderStatus from "../models/orderStatus.model";
import Product from "../models/product.model";
import ProductVariant from "../models/productVariants.model";
import User from "../models/user.model";
import mailer from "../utils/mailer";
import productService from "./product.service";
import reportService from "./report.service";

class OrderService {
  constructor() {}

  async createOrderForUser(email: string, request: OrderRequest) {
    const user = await User.findOne({ email: email }).exec();

    if (!user) {
      throw new Error("User not found");
    }

    const {
      loyaltyPoint,
      discountCode,
      shippingFee,
      address,
      details,
      totalAmount,
    } = request;

    const isUseLoyaltyPoint = loyaltyPoint > 0;

    if (isUseLoyaltyPoint && loyaltyPoint > user.loyaltyPoint) {
      throw new ArgumentError("Not enough loyalty point");
    }

    let findDiscount;

    const isUseDiscountCode: boolean =
      discountCode !== "No" && discountCode.match("^[a-zA-Z0-9]{5}$") !== null;

    if (isUseDiscountCode) {
      findDiscount = await Coupon.findOne({ code: discountCode }).exec();

      if (!findDiscount) {
        throw new ArgumentError("Discount code not found");
      }

      if (findDiscount.limit === 0) {
        throw new ArgumentError("Discount code limit reached");
      }
    }

    const newOrder = new Order({
      user: user._id,
      details: details,
      totalAmount: totalAmount,
      address: address.fullAddress,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      loyaltyPoint: loyaltyPoint,
      shippingFee: shippingFee,
      currentStatus: "Pending",

      email: email,
      ...(isUseDiscountCode && { discountCode: discountCode }),
    });

    const orderDetailsList = [];

    for (const detail of details) {
      const findVariant = await ProductVariant.findById(
        detail.variantId
      ).exec();

      let image: string | undefined = "";
      if (!findVariant) {
        throw new ArgumentError("Variant not found");
      }

      if (findVariant.images.length > 0) {
        image = findVariant.images[0];
      } else {
        const product = await Product.findById(findVariant.product).exec();

        if (!product) {
          throw new ArgumentError("Product not found");
        }

        image = product.images[0];
      }

      if (findVariant.stock < detail.quantity) {
        throw new ArgumentError("Not enough stock");
      }

      const orderDetails = await OrderDetails.create({
        variantId: detail.variantId,
        quantity: detail.quantity,
        productName: detail.productName,
        price: findVariant.price,
        basePrice: findVariant.basePrice,
        image: image,
        productId: findVariant.product,
        discount: findVariant.discount,
        attributes: detail.attributes,
      });

      findVariant.quantity -= detail.quantity;

      orderDetailsList.push(orderDetails);
    }

    newOrder.details = orderDetailsList.map((v) => v._id);

    const status = await OrderStatus.create({});

    newOrder.statuses.push(status._id);

    await newOrder.save();

    if (isUseLoyaltyPoint) {
      user.loyaltyPoint -= loyaltyPoint;

      await user.save();
    }

    if (isUseDiscountCode) {
      findDiscount.count += 1;

      findDiscount.limit -= 1;

      findDiscount.order.push(newOrder._id);

      await findDiscount.save();
    }

    mailer.sendOrderConfirmationEmail(newOrder._id, email);
    return newOrder;
  }

  async createOrderForAnonymousUser(request: OrderRequestAnonymous) {
    try {
      const foundUser = await User.findOne({
        email: request.email,
      }).exec();

      if (foundUser && !foundUser.isCreateFromAnonymousOrder) {
        throw new ArgumentError("This email is already used");
      }

      let userId: string | undefined = undefined;

      if (!foundUser) {
        const newUser = await User.create({
          email: request.email,
          role: "customer",
          loyaltyPoint: 0,
          isCreateFromAnonymousOrder: true,
        });

        userId = newUser._id.toString();
      } else {
        userId = foundUser._id.toString();
      }

      const { discountCode, shippingFee, address, details, totalAmount } =
        request;

      let findDiscount;

      const isUseDiscountCode: boolean =
        discountCode !== "No" &&
        discountCode.match("^[a-zA-Z0-9]{5}$") !== null;

      if (isUseDiscountCode) {
        findDiscount = await Coupon.findOne({ code: discountCode }).exec();

        if (!findDiscount) {
          throw new ArgumentError("Discount code not found");
        }

        if (findDiscount.limit === 0) {
          throw new ArgumentError("Discount code limit reached");
        }
      }

      const newOrder = new Order({
        user: userId,
        details: details,
        totalAmount: totalAmount,
        address: address.fullAddress,
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        shippingFee: shippingFee,
        currentStatus: "Pending",
        email: request.email,
        ...(isUseDiscountCode && { discountCode: discountCode }),
      });

      const orderDetailsList = [];

      for (const detail of details) {
        const findVariant = await ProductVariant.findById(
          detail.variantId
        ).exec();

        let image: string | undefined = "";

        if (!findVariant) {
          throw new ArgumentError("Variant not found");
        }

        if (findVariant.images.length > 0) {
          image = findVariant.images[0];
        } else {
          const product = await Product.findById(findVariant.product).exec();
          if (!product) {
            throw new ArgumentError("Product not found");
          }

          image = product.images[0];
        }

        if (findVariant.stock < detail.quantity) {
          throw new ArgumentError("Not enough stock");
        }

        const orderDetails = await OrderDetails.create({
          variantId: detail.variantId,
          quantity: detail.quantity,
          productName: detail.productName,
          price: findVariant.price,
          image: image,
          productId: findVariant.product,
          discount: findVariant.discount,
          attributes: detail.attributes,
          basePrice: findVariant.basePrice,
        });

        findVariant.quantity -= detail.quantity;

        await findVariant.save();

        orderDetailsList.push(orderDetails);
      }

      newOrder.details = orderDetailsList.map((v) => v._id);

      const status = await OrderStatus.create({});

      newOrder.statuses.push(status._id);

      await newOrder.save();

      if (isUseDiscountCode) {
        findDiscount.count += 1;

        findDiscount.limit -= 1;

        findDiscount.order.push(newOrder._id);

        await findDiscount.save();
      }

      mailer.sendOrderConfirmationEmail(newOrder._id, request.email);

      return newOrder;
    } catch (error) {
      throw error;
    }
  }
  async getAllOrders(request: GetOrderRequest) {
    const {
      page = 0,
      limit = 2,
      status,
      fromDate,
      toDate,
      search,
      sortBy,
      sortType,
    } = request;

    const query: any = {};

    if (status && status !== "All") {
      query.currentStatus = status;
    }

    if (fromDate && toDate) {
      query.createdAt = {};
      if (fromDate) {
        const startDate = new Date(fromDate);
        startDate.setUTCHours(0, 0, 0, 0);
        query.createdAt.$gte = startDate;
        console.log(`fromDate: ${startDate.toISOString()}`);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setUTCHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() + 1);
        query.createdAt.$lt = endDate;
        console.log(`toDate: ${endDate.toISOString()}`);
      }
      console.log(`createdAt Query: ${JSON.stringify(query.createdAt)}`);
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const sort: any = {};
    if (sortBy) {
      sort[sortBy] = sortType === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    try {
      const total = await Order.countDocuments(query);

      const currentPage = page;
      const totalPages = Math.ceil(total / limit);
      const isFirst = currentPage === 0;
      const isLast = currentPage === totalPages - 1 || totalPages === 0;
      const isNext = currentPage < totalPages - 1;

      const orders = await Order.find(query)
        .populate({
          path: "details",
          select: "-__v",
        })
        .populate({
          path: "statuses",
          select: "_id status createdAt",
        })
        .sort(sort)
        .skip(page * limit)
        .limit(limit)
        .lean();

      return {
        data: orders,
        pagination: {
          total,
          page: currentPage,
          limit,
          totalPages,
          isFirst,
          isLast,
          isNext,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getOrderById(id: string) {
    try {
      const order = await Order.findById(id)

        .populate({
          path: "details",
          select: "-__v",
        })
        .populate({
          path: "statuses",
          select: "_id status createdAt",
        })

        .lean();

      return order;
    } catch (error) {
      console.error("Failed to get order by ID:", error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const updatedOrder = await Order.findById(orderId)
        .populate({
          path: "details",
          select:
            "_id productName quantity price discount image productId variantId",
        })
        .populate({
          path: "statuses",
          select: "_id status createdAt",
        });

      if (!updatedOrder) {
        throw new ArgumentError("Order not found");
      }

      const statusOrder: Record<string, number> = {
        Pending: 0,
        Processing: 1,
        Shipped: 2,
        Delivered: 3,
        Cancelled: 4,
      };

      if (!(status in statusOrder)) {
        throw new ArgumentError("Invalid status");
      }

      const currentStatusIndex = statusOrder[updatedOrder.currentStatus];
      const newStatusIndex = statusOrder[status];

      if (newStatusIndex !== statusOrder.Cancelled) {
        if (newStatusIndex <= currentStatusIndex) {
          throw new ArgumentError(
            `Cannot change from ${updatedOrder.currentStatus} to ${status}`
          );
        }
      } else {
        if (currentStatusIndex >= statusOrder.Delivered) {
          throw new ArgumentError(
            `Cannot cancel order from ${updatedOrder.currentStatus}`
          );
        }
      }

      const newStatus = await OrderStatus.create({
        status,
      });

      if (status === "Delivered") {
        const loyaltyPoint = Math.floor(updatedOrder.totalAmount / 10000);
        const user = await User.findOne({ email: updatedOrder.email }).exec();

        updatedOrder.details.forEach(
          (orderDetail: { productId: string; quantity: number }) => {
            productService.updateSoldCount(
              orderDetail.productId,
              orderDetail.quantity
            );
          }
        );

        reportService.updateReport(updatedOrder);

        if (user) {
          user.loyaltyPoint += loyaltyPoint;
          await user.save();
        }
      }

      updatedOrder.set("currentStatus", status);
      updatedOrder.statuses.push(newStatus);
      await updatedOrder.save();

      return updatedOrder;
    } catch (error) {
      console.error("Failed to update order status:", error);
      throw error;
    }
  }

  async deleteOrder(id: string) {
    try {
      const order = await Order.findByIdAndDelete(id);
      if (!order) {
        throw new ArgumentError("Order not found");
      }
      return order;
    } catch (error) {
      throw error;
    }
  }

  async getOrderForUser(userId: string, status: string) {
    try {
      const query: any = { user: userId };

      if (status !== "All") {
        query.currentStatus = status;
      }

      const order = await Order.find(query)
        .populate({
          path: "details",
          select: "-__v ",
        })
        .populate({
          path: "statuses",
          select: "_id status createdAt",
        })
        .sort({ createdAt: -1 })
        .lean();

      return order || [];
    } catch (error) {
      throw error;
    }
  }

  async getCountOrders(userId: string) {
    try {
      const [pending, processing, shipping, delivered, cancelled] =
        await Promise.all([
          Order.countDocuments({
            user: userId,
            currentStatus: "Pending",
          }).exec(),
          Order.countDocuments({
            user: userId,
            currentStatus: "Processing",
          }).exec(),
          Order.countDocuments({
            user: userId,
            currentStatus: "Shipped",
          }).exec(),
          Order.countDocuments({
            user: userId,
            currentStatus: "Delivered",
          }).exec(),
          Order.countDocuments({
            user: userId,
            currentStatus: "Cancelled",
          }).exec(),
        ]);

      return {
        pending,
        processing,
        shipping,
        delivered,
        cancelled,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new OrderService();
