DEFINE TABLE OVERWRITE discovered SCHEMAFULL TYPE RELATION FROM user TO task ENFORCED
    PERMISSIONS
        FOR select, create WHERE in = $auth.id;


DEFINE FIELD OVERWRITE secret ON discovered TYPE string
    ASSERT {
        IF crypto::argon2::compare($this.out.secret_hash, $value) {
            RETURN true
        } ELSE {
            THROW "Invalid secret!"
        }
    };

DEFINE FIELD OVERWRITE timestamp ON discovered TYPE datetime READONLY VALUE time::now();
