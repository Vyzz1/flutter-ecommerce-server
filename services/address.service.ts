import ArgumentError from "../errors/AgrumentError";
import Address from "../models/address.model";

class AddressService {
  async getAddresses(userId: string) {
    try {
      const addresses = await Address.find({ user: userId })
        .sort({
          isDefault: -1,
        })
        .exec();

      return addresses || [];
    } catch (error) {
      throw new Error("Error fetching addresses");
    }
  }

  async createAddress(
    userId: string,
    fullAddress: string,
    fullName: string,
    phoneNumber: string
  ) {
    try {
      const newAddress = await Address.create({
        fullAddress,
        fullName,
        phoneNumber,
        user: userId,
      });

      return newAddress;
    } catch (error) {
      throw new Error("Error creating address");
    }
  }

  async updateAddress(
    id: string,
    fullAddress: string,
    fullName: string,
    phoneNumber: string
  ) {
    try {
      const address = await Address.findByIdAndUpdate(
        id,
        { fullAddress, fullName, phoneNumber },
        { new: true }
      );

      if (!address) {
        throw new ArgumentError("Address Not Found", 404);
      }

      return address;
    } catch (error) {
      if (error instanceof ArgumentError) {
        throw error;
      }

      throw new Error();
    }
  }

  async deleteAddress(id: string) {
    try {
      const address = await Address.findByIdAndDelete(id).exec();
      return address;
    } catch (error) {
      throw new Error("Error deleting address");
    }
  }

  async setDefaultAddress(userId: string, addressId: string) {
    try {
      await Address.updateMany({ user: userId }, { isDefault: false }).exec();

      const address = await Address.findByIdAndUpdate(
        addressId,
        { isDefault: true },
        { new: true }
      ).exec();

      return address;
    } catch (error) {
      throw new Error("Error setting default address");
    }
  }
}

export default new AddressService();
