DEFINE TABLE OVERWRITE user SCHEMAFULL
    PERMISSIONS
        FOR select, delete WHERE id = $auth.id;

DEFINE FIELD OVERWRITE name ON user TYPE string
    ASSERT {
        IF string::len($value) < 3 {
            THROW "Nazwa użytkownika musi mieć co najmniej 3 znaki!"
        };
        IF string::len($value) > 20 {
            THROW "Nazwa użytkownika może mieć maksymalnie 20 znaków!"
        };
        if !string::is::alphanum($value) {
            THROW "Nazwa użytkownika może zawierać tylko litery i cyfry!"
        };
        RETURN true;
    };

DEFINE FIELD OVERWRITE password ON user TYPE string
    VALUE rand::string(12) READONLY;

DEFINE INDEX OVERWRITE name ON user FIELDS name UNIQUE;

DEFINE ACCESS OVERWRITE user ON DATABASE TYPE RECORD
    SIGNIN (
        SELECT * FROM user WHERE
            name = $name AND
            password = $password
    )
    SIGNUP (
        CREATE user CONTENT {
            name: $name
        }
    );
