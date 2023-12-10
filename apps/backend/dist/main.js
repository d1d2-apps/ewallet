"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const firebase_config_1 = require("./config/firebase.config");
(0, firebase_config_1.initializeFirebaseApp)();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const whitelist = ['http://localhost:5173', 'http://192.168.1.114:5173', 'http://192.168.1.239:*'];
    app.enableCors({
        credentials: true,
        optionsSuccessStatus: 204,
        origin: whitelist,
        methods: 'GET, POST, PUT, PATCH, DELETE, UPDATE, OPTIONS',
    });
    await app.listen(process.env.PORT || 3333);
}
bootstrap();
//# sourceMappingURL=main.js.map