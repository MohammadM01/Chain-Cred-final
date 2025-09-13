    const app = require('./app');
    const connectDB = require('./config/db');  // Ensure this import is present
    const dotenv = require('dotenv');

    /**
     * Server entry point.
     * Loads .env, connects to DB, starts Express server.
     * For ChainCred MVP: Listens on PORT from .env or 3000.
     * BNB notes: Ensure OPBNB_TESTNET_RPC and GREENFIELD_API_KEY are set.
     */

    // Load environment variables and allow .env to override existing env vars for dev
    dotenv.config({ override: true });

    // Connect to MongoDB (await for async connection)
    (async () => {
    await connectDB();  // Await to ensure DB connects before starting server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`ChainCred backend running on port ${PORT}`);
    });
    })();
