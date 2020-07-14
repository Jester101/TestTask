const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mime = require('mime');
const fs = require('fs');
const app = express();
const utils = require('./utils');
const config = require('./config')
const port = 3000;

// Установка промежуточного окружения для парсинга тела Post запроса
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// Настройка библиотеки для сохранения файла с изображением героя.
const storage = multer.diskStorage({
   limits: {
      // ограничение в 1 Мб
      fileSize: 1024 * 1024,
   },
   destination: ".",
   filename: function (req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
         return cb(new Error('Only image are allowed.'), false);
      }
      cb(null,  'hero.' + file.originalname.split('.')[1]);
   },
   onError : function(err, next) {
      console.log('error', err);
      next(err);
   }
});
const fileUpload = multer({storage: storage});

// Обработка корня сайта (Просто возвращаем 200)
app.get('/', (req, res) => {
   res.end();
});

// Обработка запроса на получение параметров героя
app.get('/getHeroStats', (req, res) => {
   res.statusCode = 200;
   res.end(JSON.stringify(utils.loadJsonFromFile(config.gameInfoFileName, 'baseInfo')));
});

// Обработка запроса на получения изображения героя
app.get('/getHeroImage', (req, res) => {
   let filename = utils.loadJsonFromFile(config.gameInfoFileName, 'filename');
   if (filename) {
      let file = __dirname + '/' + filename;
      let mimeType = mime.getType(file);
      res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-Type', mimeType);
      let fileStream = fs.createReadStream(file);
      fileStream.pipe(res);
   }
   else {
      // ответ в json
      res.end("{\"result\": \"Картинка героя не была загружена\"}");
   }
});

// Обработка запроса на установку параметров героя
app.post('/setHeroStats', (req, res) => {
   try {
      let error = utils.checkInputJson(req.body);
      if (error.length) {
         res.statusCode = 400;
         res.end('Error: ' + error);
      }
      else {
         try {
            utils.saveJsonToFile(req.body, 'baseInfo');
         }
         catch (e) {
            res.statusCode = 500;
            res.end('{\"Error\": ' + `"${e}"}`);
         }
         res.statusCode = 200;
         res.end('{\"Result\": ' + `"Параметры героя успешно сохранены"}`);
      }
   }
   catch (e) {
      res.statusCode = 500;
      // ответ в json
      res.end('{\"Error\": ' + `"${e}"}`);
   }
});

// Обработка запроса на загрузку изображения героя
app.post('/uploadHeroImage', fileUpload.any(),  (req, res) => {
   if (!req.files.length) {
      res.statusCode = 400;
      // ответ в json
      res.end('{"Error": "Файл не выбран"}');
   }
   else {
      let file = req.files[0];
      let filename = 'hero.' + file.originalname.split('.')[1];
      utils.saveJsonToFile(filename, "filename");
      // ответ в json
      res.send('{"Result": "Изображение сохранено"}');
   }
});

app.listen(port, () => {
   console.log(`Application starts at http://localhost:${port}`);
});