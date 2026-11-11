require('dotenv').config();

const app = require('./src/app');

const connectDatabase =
    require('./src/config/database');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(
            `MongoDB API running on http://localhost:${PORT}`
        );
    });
};

startServer();