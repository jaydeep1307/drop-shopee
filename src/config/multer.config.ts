import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { existsSync, mkdirSync } from 'fs';
import * as multer from 'multer';

export const multerConfig: MulterOptions = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads'); // specify the destination directory
      if (!existsSync('./uploads')) {
        mkdirSync('./uploads');
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg and .png files are allowed'), false);
    }
  },
};
