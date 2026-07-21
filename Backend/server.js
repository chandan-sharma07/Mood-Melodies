require("dotenv").config({ quiet: true });

const app = require("./src/app");
const connectDB = require("./src/config/database");

connectDB(); // Temporarily disabled for testing server

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});


module.exports = app;
