const dotenv = require("dotenv");
dotenv.config();

const processImage = async(processSrc) => {
    const query = JSON.stringify({ processSrc: processSrc });
    const response = await fetch(
        process.env.AUTOLEVEL_URL,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: query,
        }
    );
    const responseJson = await response.json();
    return responseJson.image;

};

module.exports = processImage;