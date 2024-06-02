import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
  USER_CREATED,
  USER_LOGGEDIN,
} from 'src/common/constants/response-message.constants';
import { Public } from 'src/common/decorators/auth.decorator';
import { successResponse } from 'src/common/responses/success.helper';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninUserDto } from './dto/signin-user.dto';
import { UserService } from './user.service';

// Decorators for Swagger documentation
@ApiBearerAuth() // Specifies that bearer token authentication is required for this controller
@ApiTags('User') // Tags the controller with 'User' for Swagger documentation
@Controller('user') // Specifies the base route for this controller
export class UserController {
  constructor(private userService: UserService) {} // Injects the UserService into the controller

  // Public endpoint for creating a new user
  @Public() // Marks this endpoint as publicly accessible (no authentication required)
  @Post('/create') // Handles POST requests to /user/create
  async createUser(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    // Calls the UserService to create a new user with the provided data
    const newUser = await this.userService.createUser(createUserDto);
    // Sends a success response with status code 201 (Created) and the newly created user
    res
      .status(HttpStatus.CREATED)
      .json(successResponse(USER_CREATED, newUser, HttpStatus.CREATED));
  }

  // Public endpoint for user authentication
  @Public() // Marks this endpoint as publicly accessible (no authentication required)
  @Post('/singin') // Handles POST requests to /user/singin
  async signinUser(@Body() signinUserDto: SigninUserDto, @Res() res: Response) {
    // Calls the UserService to authenticate the user with the provided credentials
    const loggedInUser = await this.userService.loginUser(signinUserDto);
    // Sends a success response with status code 200 (OK) and the authenticated user
    return res
      .status(HttpStatus.OK)
      .json(successResponse(USER_LOGGEDIN, loggedInUser, HttpStatus.OK));
  }
}
