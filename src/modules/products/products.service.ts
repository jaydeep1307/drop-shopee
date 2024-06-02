import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PRODUCT_NOT_FOUND } from "src/common/constants/response-message.constants";
import {
  AuthExceptions,
  CustomError,
  TypeExceptions,
} from "src/common/exceptions";
import {
  BidSlot,
  BidUser,
  WinnerUser,
} from "src/common/interfaces/jwt.interface";
import { CreateProductDto } from "./dto/create-product.dto";
import { CreateSlotsDto } from "./dto/create-slot.dto";
import { PlaceBidDto } from "./dto/place-bid.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductStatus } from "src/common/enums";
import { Product, ProductDocument } from "./schemas/product.schema";
import { User, UserDocument } from "../user/schemas/user.schema";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModal: Model<ProductDocument>,
    @InjectModel(User.name) private userModal: Model<UserDocument>
  ) {}

  // Method to create a new product
  async createProduct(createProductDto: CreateProductDto) {
    const { name, price, category, image } = createProductDto;

    // Ensure the product was not created by the current user
    const isProductAlreadyExists = await this.productModal.findOne({
      name,
      category,
    });

    if (isProductAlreadyExists)
      throw AuthExceptions.ForbiddenException(
        `You can't create same product twice`
      );

    // Create and return the new product
    const product = await this.productModal.create({
      name,
      price,
      category,
      image,
    });

    const payload = {
      _id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
    };

    return payload;
  }

  // Method to find all products with pagination and search
  async findAllProducts(page: number, limit: number, search: string) {
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const products = await this.productModal
      .find(query, { name: 1, price: 1, category: 1, image: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await this.productModal.countDocuments(query);

    const productsPayload = {
      allProducts: products,
      total_records: total,
    };

    return productsPayload;
  }

  // Method to find details of a specific product
  async findOneProduct(productId: string) {
    const product = await this.findProductById(productId);

    const payload = {
      _id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
    };

    return payload;
  }

  // Method to update details of a product
  async updateProduct(productId: string, updateProductDto: UpdateProductDto) {
    // Find product from database
    const product = await this.productModal.findOne({
      _id: productId,
    });
    if (!product)
      throw AuthExceptions.ForbiddenException(
        "You are not allowed to update this product"
      );

    if (
      updateProductDto.price &&
      product.status !== ProductStatus.NotReadyToBid
    ) {
      throw CustomError.UnknownError(
        "Currently you can't update your product price"
      );
    }

    // Update the product
    const updatedProduct = await this.productModal.findByIdAndUpdate(
      productId,
      { $set: updateProductDto },
      { new: true }
    );

    if (!updatedProduct)
      throw TypeExceptions.NotFoundCommMsg(PRODUCT_NOT_FOUND);

    const payload = {
      _id: updatedProduct._id,
      name: updatedProduct.name,
      price: updatedProduct.price,
      category: updatedProduct.category,
      image: updatedProduct.image,
    };

    return payload;
  }

  // Method to delete a product
  async deleteProuct(productId: string) {
    // Find product from database
    const product = await this.productModal.findOne({
      _id: productId,
    });
    if (!product)
      throw AuthExceptions.ForbiddenException(
        "You are not allowed to delete this product"
      );

    // Delete the product
    const deletedProduct = await this.productModal.findByIdAndDelete(productId);

    if (!deletedProduct)
      throw TypeExceptions.NotFoundCommMsg(PRODUCT_NOT_FOUND);
  }

  // Method to create slots for a product
  async createSlots(productId: string, createSlotsDto: CreateSlotsDto) {
    const { slotPrice, slotUnits } = createSlotsDto;

    // Find the product by ID
    const product = await this.findProductById(productId);

    const productPrice = product.price;
    const currentSlotPrice = slotPrice * slotUnits;

    // Validate the product status
    if (product.status !== ProductStatus.NotReadyToBid) {
      throw CustomError.UnknownError("You can't create slot for this product");
    }

    // Calculate the total slot amount already allocated
    let totalSlotAmount = product.bidSlots.reduce(
      (total, slot) => total + slot.slotPrice * slot.slotUnits,
      0
    );

    // Check if adding the new slot would exceed the product price
    if (totalSlotAmount + currentSlotPrice > productPrice) {
      throw CustomError.UnknownError("Slot price exceeded the product price");
    }

    // Check if slot price is equal to product price then update the product status
    if (totalSlotAmount + currentSlotPrice === productPrice) {
      product.status = ProductStatus.ReadyToBid;
    }

    // Update or add the slot
    this.updateOrAddSlot(product, slotPrice, slotUnits);

    // Save the product to persist changes
    await product.save();

    const { bidSlots } = product;

    return {
      bidSlots,
      remainingAmount: productPrice - totalSlotAmount - currentSlotPrice,
      productPrice,
    };
  }

  // Method to place a bid on a product
  async placeBid(productId: string, placeBidDto: PlaceBidDto, userId: string) {
    const { bidAmount, bidQuantity } = placeBidDto;

    // Find the product by ID
    const product = await this.findProductById(productId);

    // Validate the product status and bid
    const existingSlot = this.validateBid(product, bidAmount, bidQuantity);

    // Update the slot with the bid
    this.updateSlot(existingSlot, bidQuantity, product);

    // Update the user's bid
    this.updateUserBid(product, userId, bidAmount, bidQuantity);

    // Save the product to persist changes
    await product.save();
  }

  async declareWinner(productId: string) {
    // Find the product by ID
    const product = await this.findProductById(productId);

    if (product.status !== ProductStatus.BidCompleted) {
      throw CustomError.UnknownError(
        "You can't declare winner for this product"
      );
    }

    // Extract bid users array from product
    const bidUsers = product.bidUsers;

    // Array of users price ranges according to their bid amount
    const priceRanges = this.userPriceRange(bidUsers);

    const randomNumber = this.getRandomNumber(product.price);

    const bidWinner = await this.findRandomUser(
      priceRanges,
      randomNumber,
      bidUsers
    );

    product.bidWinner = bidWinner._id; // Stored bid winner Id
    product.status = ProductStatus.Sold; // Changed status to Sold Product

    product.save();

    return bidWinner;
  }

  // ============================== HELPER FUNCTIONS ===================================

  // Helper function to find the product by ID
  private async findProductById(productId: string) {
    const product = await this.productModal.findById(productId);
    if (!product) throw TypeExceptions.NotFoundCommMsg(PRODUCT_NOT_FOUND);
    return product;
  }

  // Helper function to update or add a new slot
  private updateOrAddSlot(
    product: ProductDocument,
    slotPrice: number,
    slotUnits: number
  ) {
    const existingSlot = product.bidSlots.find(
      (slot) => slot.slotPrice === slotPrice
    );

    if (existingSlot) {
      existingSlot.slotUnits += slotUnits;
      existingSlot.remainingUnits = existingSlot.slotUnits;
      product.markModified("bidSlots");
    } else {
      product.bidSlots.push({
        slotPrice,
        slotUnits,
        remainingUnits: slotUnits,
      });
    }
  }

  // Helper function to validate the product status and bid
  private validateBid(
    product: ProductDocument,
    bidAmount: number,
    bidQuantity: number
  ) {
    if (product.status !== ProductStatus.ReadyToBid) {
      throw CustomError.UnknownError("You cannot place a bid on this product");
    }

    const existingSlot = product.bidSlots.find(
      (slot) => slot.slotPrice === bidAmount
    );

    if (!existingSlot) {
      throw CustomError.UnknownError("Bid amount does not exist");
    }

    if (existingSlot.remainingUnits < bidQuantity) {
      throw CustomError.UnknownError(
        "Bid quantity limit exceeded, please try with a lower quantity"
      );
    }

    return existingSlot;
  }

  // Helper function to update the slot with the bid
  private updateSlot(
    existingSlot: BidSlot,
    bidQuantity: number,
    product: ProductDocument
  ) {
    existingSlot.remainingUnits -= bidQuantity;
    product.markModified("bidSlots");

    if (existingSlot.remainingUnits === 0) product.bookedSlots += 1;
    if (product.bookedSlots === product.bidSlots.length) {
      product.status = ProductStatus.BidCompleted;
    }
  }

  // Helper function to update the user's bid
  private updateUserBid(
    product: ProductDocument,
    userId: string,
    bidAmount: number,
    bidQuantity: number
  ) {
    const existingUser = product.bidUsers.find(
      (user) => user.userId === userId
    );

    if (existingUser) {
      existingUser.investedAmount += bidAmount * bidQuantity;
      product.markModified("bidUsers");
    } else {
      product.bidUsers.push({
        userId,
        investedAmount: bidAmount * bidQuantity,
      });
    }
  }

  // Helper function to calculate the price range of a product
  private userPriceRange(bidUsers: BidUser[]): number[] {
    const priceRange = bidUsers.reduce((ranges: number[], bid) => {
      if (ranges.length === 0) return [bid.investedAmount];

      ranges.push(ranges[ranges.length - 1] + bid.investedAmount);
      return ranges;
    }, []);

    return priceRange;
  }

  //Helper function to get random number
  private getRandomNumber(amount: number): number {
    return Math.ceil(Math.random() * amount);
  }

  //Helper function to find random user
  private async findRandomUser(
    priceRanges: number[],
    randomNumber: number,
    bidUsers: BidUser[]
  ): Promise<WinnerUser> {
    // Find the index of the first element in the priceRanges array that is greater than or equal to randomNumber
    // const userIndex = priceRanges.findIndex(
    //   (priceRange) => priceRange >= randomNumber
    // );

    // Find index with binary search
    const userIndex = this.binarySearchTofindIndex(priceRanges, randomNumber);

    const winnerUserId = bidUsers[userIndex].userId;

    const winnerUser = await this.userModal.findById(winnerUserId);

    const userPayload = {
      _id: winnerUserId,
      name: winnerUser.name,
    };

    return userPayload;
  }

  private binarySearchTofindIndex(priceRanges: number[], randomNumber): number {
    let low = 0;
    let high = priceRanges.length - 1;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);

      if (priceRanges[mid] < randomNumber) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return low;
  }
}
