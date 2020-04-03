// entry point del servidor
import { app } from './server';
import { PORT } from './utils/config';

app.listen(PORT, () => console.log(`Listening at port ${PORT}`));
