import { envs } from './config/envs';
import { AppRouter } from './routes';
import { Server } from './server';


(async () => {
    const server = new Server({
        port: envs.PORT,
        host: envs.HOST,
        public_path: envs.PUBLIC_PATH,
        routes: AppRouter.routes,
    });

    await server.start();
})();