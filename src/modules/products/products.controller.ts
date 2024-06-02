import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import {
  BID_PLACE,
  PRODUCT_CREATED,
  PRODUCT_DELETE,
  PRODUCT_DETAIL,
  PRODUCT_LIST,
  PRODUCT_UPDATED,
  SLOT_CREATED,
} from "src/common/constants/response-message.constants";
import { Public } from "src/common/decorators/auth.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRoles } from "src/common/enums";
import { AuthExceptions } from "src/common/exceptions";
import { successResponse } from "src/common/responses/success.helper";
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
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    // Extract user ID from request
    const userId = req["user"]["_id"];
    if (!userId) throw AuthExceptions.ForbiddenException();

    // Create the new product and return success response
    const newProduct = await this.productsService.createProduct(
      createProductDto
    );
    return res
      .status(HttpStatus.CREATED)
      .json(successResponse(PRODUCT_CREATED, newProduct, HttpStatus.CREATED));
  }

  // Endpoint to get all products
  @Public()
  @Get("getAllProducts")
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
  })
  async findAll(
    @Res() res: Response,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search: string = ""
  ) {
    // Retrieve all products based on pagination and search query
    const allProducts = await this.productsService.findAllProducts(
      page,
      limit,
      search
    );
    return res
      .status(HttpStatus.OK)
      .json(successResponse(PRODUCT_LIST, allProducts, HttpStatus.OK));
  }

  // Endpoint to get details of a specific product
  @Public()
  @Get("productDetails/:id")
  async findOne(@Param("id") id: string, @Res() res: Response) {
    // Find details of the product with the given ID
    const product = await this.productsService.findOneProduct(id);

    return res
      .status(HttpStatus.OK)
      .json(successResponse(PRODUCT_DETAIL, product, HttpStatus.OK));
  }

  // Endpoint to update details of a product
  @Roles(UserRoles.Admin)
  @Patch("updateProduct/:id")
  async updateProduct(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Res() res: Response
  ) {
    // Update the product and return success response
    const updatedProduct = await this.productsService.updateProduct(
      id,
      updateProductDto
    );

    return res
      .status(HttpStatus.OK)
      .json(successResponse(PRODUCT_UPDATED, updatedProduct, HttpStatus.OK));
  }

  // Endpoint to delete a product
  @Roles(UserRoles.Admin)
  @Delete("deleteProduct/:id")
  async remove(@Param("id") id: string, @Res() res: Response) {
    // Remove the product and return success response
    await this.productsService.deleteProuct(id);
    return res
      .status(HttpStatus.OK)
      .json(successResponse(PRODUCT_DELETE, {}, HttpStatus.OK));
  }

  // Endpoint to create slots for product
  @Roles(UserRoles.Admin)
  @Post("createSlots/:id")
  async createSlots(
    @Param("id") id: string,
    @Body() createSlotsDto: CreateSlotsDto,
    @Res() res: Response
  ) {
    // Create slots for the product and return success response
    const newSlots = await this.productsService.createSlots(id, createSlotsDto);
    return res
      .status(HttpStatus.CREATED)
      .json(successResponse(SLOT_CREATED, newSlots, HttpStatus.CREATED));
  }

  // Endpoint to place a bid for a product
  @Roles(UserRoles.Customer)
  @Post("placeBid/:id")
  async placeBid(
    @Param("id") id: string,
    @Body() placeBidDto: PlaceBidDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    // Extract user ID from request
    const userId = req["user"]["_id"];
    if (!userId) throw AuthExceptions.ForbiddenException();

    // Place a bit for the user
    await this.productsService.placeBid(id, placeBidDto, userId);
    return res
      .status(HttpStatus.CREATED)
      .json(successResponse(BID_PLACE, {}, HttpStatus.CREATED));
  }

  //Endpoint to declare winner of the product
  @Roles(UserRoles.Admin)
  @Post("declareWinner/:id")
  async declareWinner(@Param("id") id: string, @Res() res: Response) {
    // Declare the winner of the product
    const winnerUser = await this.productsService.declareWinner(id);
    return res
      .status(HttpStatus.OK)
      .json(
        successResponse(
          `${winnerUser.name} is the winner `,
          winnerUser,
          HttpStatus.OK
        )
      );
  }
}
