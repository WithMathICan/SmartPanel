CREATE TABLE blog.status(
   id SERIAL PRIMARY KEY,
   title VARCHAR(20)
);

INSERT INTO blog.status (id, title) values (0, 'НЕ Активный');
INSERT INTO blog.status (id, title) values (1, 'Активный');

create table blog.category(
   id serial primary key,
   title varchar(30) not null,
   description varchar(500),
   alias varchar(30) not null
);

ALTER TABLE blog.category ADD CONSTRAINT unique_alias UNIQUE (alias);
ALTER TABLE blog.category ADD CONSTRAINT alias_length_more_than_3 CHECK (LENGTH(alias)>3);
ALTER TABLE blog.category ADD CONSTRAINT title_length_more_than_3 CHECK (LENGTH(title)>3);