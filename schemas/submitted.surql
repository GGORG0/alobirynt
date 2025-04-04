DEFINE TABLE OVERWRITE submitted SCHEMAFULL TYPE RELATION FROM user TO task ENFORCED
    PERMISSIONS
        FOR select, create WHERE in = $auth.id AND count(->task<-discovered<-(user WHERE id = $auth)) > 0;

DEFINE FIELD OVERWRITE answer ON submitted TYPE float;
DEFINE FIELD OVERWRITE correct ON submitted
    VALUE <future> { ->task.answer ?= answer } READONLY;

DEFINE FIELD OVERWRITE timestamp ON submitted TYPE datetime READONLY VALUE time::now();

DEFINE INDEX unique_submits
    ON TABLE submitted
    COLUMNS in, out UNIQUE;