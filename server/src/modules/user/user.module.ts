import { Module, forwardRef } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserResolver } from "./user.resolver";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { SiteModule } from "../site/site.module";
import { OrderService } from "../order/order.service";
import { OrderModule } from "../order/order.module";
import { ItemModule } from "../item/item.module";

@Module({
    providers: [UserService, UserResolver],
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.register({ secret: "12345"}),
        forwardRef(() => SiteModule),
        forwardRef(() => OrderModule)
    ],
    exports: [UserService]
})
export class UserModule {}
