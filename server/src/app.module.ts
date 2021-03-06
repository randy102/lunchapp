import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { DishModule } from "./modules/dish/dish.module";
import { GraphQLModule } from "@nestjs/graphql";
import { UserModule } from "./modules/user/user.module";
import { join } from "path";
import { SiteModule } from "./modules/site/site.module";
import { OrderModule } from "./modules/order/order.module";
import { MenuModule } from "./modules/menu/menu.module";
import { ItemModule } from "./modules/item/item.module";
import { ShopModule } from "./modules/shop/shop.module";
import { ItemController } from "./modules/item/item.controller";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule as CogModule } from "./modules/config/config.module";
import { APP_GUARD } from "@nestjs/core";
import { GqlAuthGuard } from "./common/guard/auth.guard";
import { AppController } from "./app.controller";
import { UserService } from "./modules/user/user.service";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: "mongodb",
            url:
                "mongodb+srv://randy:12345@randy-dkqal.gcp.mongodb.net/lun?retryWrites=true&w=majority",
            entities: [join(__dirname, "**/**.entity{.ts,.js}")],
            synchronize: true,
            useUnifiedTopology: true
        }),
        GraphQLModule.forRootAsync({
            imports: [UserModule],
            useFactory: async (userService: UserService) => ({
                typePaths: ["./**/*.graphql"],
                context: ({ req, connection }) =>
                    connection ? { ...connection.context } : { request: req },
                installSubscriptionHandlers: true,
                subscriptions: {
                    onConnect: param => {
                        try {
                            const token = param["authorization"];
                            if (!token) throw new Error("Not having token");

                            const isValid = userService.validate(token);
                            if (!isValid) throw new Error("Token not valid");

                            return userService.decode(token);
                        } catch (err) {
                            console.log(err);
                            return false;
                        }
                    }
                }
            }),
            inject: [UserService]
        }),
        ScheduleModule.forRoot(),
        UserModule,
        SiteModule,
        MenuModule,
        OrderModule,
        DishModule,
        ItemModule,
        ShopModule,
        CogModule
    ],

    controllers: [AppController, ItemController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: GqlAuthGuard
        }
    ]
})
export class AppModule {}
