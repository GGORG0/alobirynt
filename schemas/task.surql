DEFINE TABLE OVERWRITE task SCHEMAFULL
    PERMISSIONS
        FOR select FULL;

DEFINE FIELD OVERWRITE name ON task TYPE string;

DEFINE FIELD OVERWRITE content ON task TYPE string
    PERMISSIONS
        FOR select WHERE count(<-discovered<-(user WHERE id = $auth)) > 0;

-- private
DEFINE FIELD OVERWRITE secret ON task TYPE string
    VALUE rand::string(8) READONLY
    PERMISSIONS NONE;

-- public
DEFINE FIELD OVERWRITE secret_hash ON task
    VALUE crypto::argon2::generate(secret) READONLY;

-- private
DEFINE FIELD OVERWRITE answer ON task TYPE float
    PERMISSIONS NONE;

-- public
DEFINE FIELD OVERWRITE answer_hash ON task
    VALUE crypto::argon2::generate(<string>answer) READONLY
    PERMISSIONS
        FOR select WHERE count(<-discovered<-(user WHERE id = $auth)) > 0;

DEFINE FIELD OVERWRITE points_solved ON task TYPE int;
DEFINE FIELD OVERWRITE points_discovered ON task TYPE int;

DEFINE FIELD OVERWRITE discovered ON task
    VALUE <future> { count(<-discovered<-(user WHERE id = $auth)) > 0 } READONLY;

DEFINE FIELD OVERWRITE solved ON task
    VALUE <future> { count(<-(submitted WHERE correct = true)<-(user WHERE id = $auth)) > 0 } READONLY;

DEFINE FIELD OVERWRITE answered ON task
    VALUE <future> { count(<-submitted<-(user WHERE id = $auth)) > 0 } READONLY;
