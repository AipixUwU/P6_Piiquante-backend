const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'images')
    },
    filename: (req, file, callback) => {
      const extension = file.originalname.split('.').pop();
      const name = file.originalname.replace(`.${extension}`, '');  // Permet de remplacer l'extension de l'image par une chaine vide grace a la variable créer plus tôt
      const timestamp = Date.now();
      callback(null, `${name}${timestamp}.${extension}`);
    }
  });

module.exports = multer({ storage }).single('image');
