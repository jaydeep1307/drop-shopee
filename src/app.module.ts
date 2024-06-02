import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./providers/database/database.module";
import { ProductsModule } from "./modules/products/products.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./security/guards/jwt-auth.guard";
import { UserModule } from "./modules/user/user.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { UploadModule } from "./modules/upload/upload.module";
import { join } from "path";
import { RolesGuard } from "./security/guards/role.guard";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"), // Path to the uploads folder
      serveRoot: "/uploads", // The URL at which the files will be available
    }),
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    DatabaseModule,
    UserModule,
    ProductsModule,
    UploadModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
