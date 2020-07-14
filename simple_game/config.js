
const typeErrorMessage = 'Поле "{}" не соответсвует описанному типу "{}"';
const extraKeyError = 'Полученно неописанно поле/поля "{}"';
const expectedKeyError = 'В запросе отсутствует поле/поля "{}"';

const keysTypes = {
    "name": "string",
    "strength": "int",
    "dexterity": "int",
    "intellect": "int",
    "isInvincible": "boolean",
}

const gameInfoFileName = "./gameInfo.json";

module.exports.typeErrorMessage = typeErrorMessage;
module.exports.extraKeyError = extraKeyError;
module.exports.expectedKeyError = expectedKeyError;
module.exports.keysTypes = keysTypes;
module.exports.gameInfoFileName = gameInfoFileName;