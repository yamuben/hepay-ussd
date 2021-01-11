import dotenv from 'dotenv';
import app from './index';

dotenv.config({ path: './config.env' });

const port = process.env.PORT;

app.listen(port, () => {
  process.stdout.write(
    `Listening on port ${port} ...\n******************** \n`
  );
});
