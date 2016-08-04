// Global jwt token
global.jwtTokenSecret = 'd36jFLn235gs57dgldfNAK_JNDSG2mdfl324smJ23589fmY';
global.localConnectionString = 'postgres://localhost:5432/jukebox_messaging_api';
global.productionConnectionString = '';

process.env.NODE_ENV = 'development';
//process.env.NODE_ENV = 'production';

global.nameDatabase_development = 'jukebox_messaging_api';
global.usernameDatabase_development = 'koraygocmen';
global.passwordDatabase_development = 'tk95961523';

global.nameDatabase_production = '';
global.usernameDatabase_production = '';
global.passwordDatabase_production = '';