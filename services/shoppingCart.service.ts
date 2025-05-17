import { populate } from "dotenv";
import ProductVariant from "../models/productVariants.model";
import ShoppingCartItem from "../models/shopping-cart.model";
import User from "../models/user.model";
import ArgumentError from "../errors/AgrumentError";

class ShoppingCartService {
  constructor() {}

  async createShoppingCart(user: string, shoppingCart: ShoppingCartRequest) {
    try {
      const foundUser = await User.findById(user).exec();

      if (!foundUser) {
        throw new ArgumentError("User not found", 404);
      }

      const variant = await ProductVariant.findById(
        shoppingCart.variantId
      ).exec();

      if (!variant) {
        throw new ArgumentError("Product not found", 404);
      }

      const oldShoppingCart = await ShoppingCartItem.findOne({
        user: user,
        variant: shoppingCart.variantId,
      }).exec();
      if (
        oldShoppingCart != null &&
        oldShoppingCart.quantity + shoppingCart.quantity > variant.stock
      ) {
        throw new ArgumentError("Not enough stock available", 400);
      }
      if (oldShoppingCart) {
        oldShoppingCart.quantity += shoppingCart.quantity;

        const cart = await oldShoppingCart.save();

        return cart;
      } else {
        if (shoppingCart.quantity > variant.stock) {
          throw new ArgumentError("Not enough stock available", 400);
        }

        const newShoppingCart = await ShoppingCartItem.create({
          user: user,
          variant: shoppingCart.variantId,
          quantity: shoppingCart.quantity,
        });

        return newShoppingCart;
      }
    } catch (error) {
      throw error;
    }
  }

  async getShoppingCartForAnonymousUser(
    shoppingCart: Array<ShoppingCartRequest>
  ) {
    try {
      const variants = await ProductVariant.find({
        _id: { $in: shoppingCart.map((item) => item.variantId) },
      })
        .populate({
          path: "product",
          select: "name category images",
          populate: {
            path: "category",
            select: "name image",
          },
        })
        .populate({
          path: "attributes.attribute",
          select: "name",
        })
        .select("price stock attributes images discount product")
        .exec();

      const cart = shoppingCart
        .map((item) => {
          const variant = variants.find(
            (v) => v._id.toString() === item.variantId
          );

          if (!variant || item.quantity > variant.stock) {
            return null;
          }

          return {
            _id: item.id,
            variant: variant,
            quantity: item.quantity,
            user: "anonymous",
          };
        })
        .filter((item) => item !== null);

      return cart;
    } catch (error) {
      throw error;
    }
  }

  async deleteShoppingCart(shoppingCartId: string) {
    try {
      const cart = await ShoppingCartItem.findByIdAndDelete(
        shoppingCartId
      ).exec();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getShoppingCart(user: string) {
    try {
      const cart = await ShoppingCartItem.find({ user: user })
        .populate({
          path: "variant",
          select: "price stock attributes  images discount product",
          populate: [
            {
              path: "product",
              select: "name category images",
              populate: {
                path: "category",
                select: "name image",
              },
            },

            {
              path: "attributes.attribute",
              select: "name",
            },
          ],
        })
        .sort({ createdAt: -1 })
        .exec();

      return cart;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async updateShoppingCart(shoppingCartId: string, newQuantity: number) {
    try {
      const cartItem = await ShoppingCartItem.findById(shoppingCartId)
        .populate("variant", "stock")
        .exec();

      if (!cartItem) {
        return Promise.reject("Shopping cart item not found");
      }

      if (newQuantity > cartItem.variant.stock) {
        return Promise.reject("Not enough stock available");
      }

      cartItem.quantity = newQuantity;

      const updatedCart = await cartItem.save();
      return updatedCart;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export default new ShoppingCartService();
