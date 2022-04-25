const processImage = require('../../../server/processImage');
const { base64Decode } = require('../../../utils');

export default async function handler(req, res) {
    if (req.method !== 'GET') {
      res.statusCode(405).send({ message: 'Only POST requests allowed' })
      return
    }
  
    const processSrc = base64Decode(req.query.processSrc);
    const imageUrl = await processImage(processSrc);
    res.send({image: imageUrl});
    //const imageBuff = Buffer.from(imageData, 'base64');
    //res.setHeader("content-type", 'image/jpeg');
    //res.send(imageBuff);
  }