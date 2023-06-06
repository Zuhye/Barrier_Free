
CREATE TABLE Users(
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(128) NOT NULL,
    password VARCHAR(128) NOT NULL,
    name VARCHAR(64) NOT NULL,
    PRIMARY KEY(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE Plans(
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    trip_name VARCHAR(64) NOT NULL,
    date DATE NOT NULL,
    place JSON,
    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;