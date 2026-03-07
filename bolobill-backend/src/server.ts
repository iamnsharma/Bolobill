import {app} from './app';
import {connectDatabase} from './config/database';
import {env} from './config/env';

const bootstrap = async () => {
  await connectDatabase();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`BoloBill backend running on http://localhost:${env.PORT}`);
  });
};

bootstrap().catch(error => {
  // eslint-disable-next-line no-console
  console.error('Failed to start backend', error);
  process.exit(1);
});
