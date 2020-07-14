const fs = require('fs');
const config = require('./config');

String.prototype.format = function () {
    let i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

/**
 * checkInputJson - Функция проверки валидности принятых данных
 * @param inputJson - принятое тело запроса в формате JSON
 * @param schema - Ассоциативный массив, описывающий типы переменных заданных ключей
 * @returns {string} - Строка, содержащая описание ошибки. Если данные соответсвуют требованиям, вернятся
 * пустая строка
 */
function checkInputJson(inputJson, schema = config.keysTypes) {
    let keys = Object.keys(schema);
    let errorString = '';
    let keysValidation = checkInputKeys(inputJson, keys);
    if (keysValidation[0].length)
        errorString = config.extraKeyError.format(keysValidation[0]);
    else if (keysValidation[1].length)
        errorString = config.expectedKeyError.format(keysValidation[1]);
    else
        for(let key in inputJson)
            errorString += checkType(inputJson[key], schema[key]) ? '' : '\n' + config.typeErrorMessage.format(key, keys[key])
    return errorString;
}

/**
 * checkType - Функция, проверяющая тип определённого элемента
 * @param element - проверяемый элемент
 * @param type - ожидаемый тип переменной элемента
 * @returns {boolean} - результат проверки
 */
function checkType(element, type) {
    if (type === 'int')
        return Number.isInteger(element);
    else
        return typeof element === type;
}

/**
 * checkInputKeys - Функция, проверяющая наличие лишних ключей или отсутсвие необходимых в объекте(JSON)
 * @param inputJson - проверяемый оюъект
 * @param keys - список необходимых ключей
 * @returns {(string[]|*)[]} - [массив лишних ключей, массив отсутствующих ключей]
 */
function checkInputKeys(inputJson, keys) {
    let inputKeys = Object.keys(inputJson);
    let extraKeys = inputKeys.filter(e => !keys.includes(e));
    let expectedKeys = keys.filter(e => !inputKeys.includes(e));
    return [extraKeys, expectedKeys];
}

/**
 * saveJsonToFile - Функция для сохранения данных об параметрах героя в локальный файл формата .json
 * @param data - данные, которые должны быть сохранены
 * @param key - название ключа, по которому данные будут сохранены
 * @param filename - название файла, в который будет записан результат сохранения
 * @returns {boolean} - результат успешности выполнения операции сохранения
 */
function saveJsonToFile(data, key, filename=config.gameInfoFileName) {
    let oldData = JSON.parse(fs.readFileSync(filename));
    if (oldData.hasOwnProperty(key)) {
        oldData[key] = data;
        fs.writeFileSync(filename, JSON.stringify(oldData));
        return true;
    }
    return false;
}

/**
 * loadJsonFromFile - Функция для получения ранее сохранённой информации
 * @param filename - файл, содержащий сохраненную информацию
 * @param key - ключ поля, который необходимо получить
 * @returns {null|any} - null, если нет данных по указанному ключу, сохраненные данные в ином случае
 */
function loadJsonFromFile(filename=config.gameInfoFileName, key=null) {
    let oldData = JSON.parse(fs.readFileSync(filename));
    if (!key)
        return oldData;
    if (oldData.hasOwnProperty(key))
        return oldData[key];
    return null;
}

module.exports.loadJsonFromFile = loadJsonFromFile;
module.exports.saveJsonToFile = saveJsonToFile;
module.exports.checkInputJson = checkInputJson;