import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Public } from "src/common/decorators/auth.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRoles } from "src/common/enums";
import { AuthExceptions } from "src/common/exceptions";
import { CreateProductDto } from "./dto/create-product.dto";
import { CreateSlotsDto } from "./dto/create-slot.dto";
import { PlaceBidDto } from "./dto/place-bid.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@ApiBearerAuth()
@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Endpoint to create a new product
  @Post("createProduct")
  @Roles(UserRoles.Admin)
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.createProduct(createProductDto);
  }

  // Endpoint to get all products
  @Public()
  @Get("getAllProducts")
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search: string = ""
  ) {
    return await this.productsService.findAllProducts(page, limit, search);
  }

  // Endpoint to get details of a specific product
  @Public()
  @Get("productDetails/:id")
  @HttpCode(HttpStatus.OK)
  async findOne(@Param("id") id: string) {
    return await this.productsService.findOneProduct(id);
  }

  // Endpoint to update details of a product
  @Roles(UserRoles.Admin)
  @Patch("updateProduct/:id")
  @HttpCode(HttpStatus.OK)
  async updateProduct(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return await this.productsService.updateProduct(id, updateProductDto);
  }

  // Endpoint to delete a product
  @Roles(UserRoles.Admin)
  @Delete("deleteProduct/:id")
  @HttpCode(HttpStatus.OK)
  async remove(@Param("id") id: string) {
    return await this.productsService.deleteProuct(id);
  }

  // Endpoint to create slots for product
  @Roles(UserRoles.Admin)
  @Post("createSlots/:id")
  @HttpCode(HttpStatus.CREATED)
  async createSlots(
    @Param("id") id: string,
    @Body() createSlotsDto: CreateSlotsDto
  ) {
    return await this.productsService.createSlots(id, createSlotsDto);
  }

  // Endpoint to place a bid for a product
  @Roles(UserRoles.Customer)
  @Post("placeBid/:id")
  @HttpCode(HttpStatus.OK)
  async placeBid(
    @Param("id") id: string,
    @Body() placeBidDto: PlaceBidDto,
    @Req() req: Request
  ) {
    // Extract user ID from request
    const userId = req["user"]["_id"];
    if (!userId) throw AuthExceptions.ForbiddenException();

    // Place a bit for the user
    return await this.productsService.placeBid(id, placeBidDto, userId);
  }

  //Endpoint to declare winner of the product
  @Roles(UserRoles.Admin)
  @Post("declareWinner/:id")
  @HttpCode(HttpStatus.OK)
  async declareWinner(@Param("id") id: string) {
    return await this.productsService.declareWinner(id);
  }
}
