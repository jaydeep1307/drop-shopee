import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorators/auth.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { SigninUserDto } from "./dto/signin-user.dto";
import { UserService } from "./user.service";

// Decorators for Swagger documentation
@ApiBearerAuth() // Specifies that bearer token authentication is required for this controller
@ApiTags("User") // Tags the controller with 'User' for Swagger documentation
@Controller("user") // Specifies the base route for this controller
export class UserController {
  constructor(private userService: UserService) {} // Injects the UserService into the controller

  // Public endpoint for creating a new user
  @Public() // Marks this endpoint as publicly accessible (no authentication required)
  @Post("/create")
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  // Public endpoint for user authentication
  @Public() // Marks this endpoint as publicly accessible (no authentication required)
  @Post("/singin") // Handles POST requests to /user/singin
  @HttpCode(HttpStatus.OK)
  async signinUser(@Body() signinUserDto: SigninUserDto) {
    return await this.userService.loginUser(signinUserDto);
  }
}
