import app from './src/app.js';

const startServer = () => {
    const port = process.env.PORT || 3000;
    app.listen(port, function () {
        console.log(`Server is running on port ${port}`);
    });
};

startServer();
