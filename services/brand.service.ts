import ArgumentError from "../errors/AgrumentError";
import Brand from "../models/brand.model";

class BrandService {
  async getBrands() {
    const brands = await Brand.find({})

      .select("-__v")
      .lean()
      .exec();
    return brands;
  }

  async createBrand(name: string) {
    try {
      const findEx = await Brand.findOne({ name }).exec();
      if (findEx) {
        throw new ArgumentError("Brand already exists");
      }
      const brand = new Brand({ name });
      await brand.save();
      return brand;
    } catch (error) {
      throw error;
    }
  }

  async deleteBrand(id: string) {
    const brand = await Brand.findByIdAndDelete(id).exec();

    if (!brand) {
      throw new ArgumentError("Brand not found");
    }

    return brand;
  }

  async updateBrand(id: string, brandName: string) {
    try {
      const findEx = await Brand.findOne({
        name: brandName,
        _id: { $ne: id },
      }).exec();

      if (findEx) {
        throw new ArgumentError("Brand already exists");
      }

      const brandToUpdate = await Brand.findById(id).exec();

      if (!brandToUpdate) {
        throw new ArgumentError("Brand not found");
      }

      brandToUpdate.name = brandName;

      await brandToUpdate.save();
      return brandToUpdate;
    } catch (error) {
      throw error;
    }
  }
}

export default new BrandService();
