CREATE SCHEMA courses;
CREATE SCHEMA users;

CREATE TABLE users.roles (
	idrole serial NOT NULL,
	name varchar NULL,
	CONSTRAINT roles_pk PRIMARY KEY (idrole)
);

CREATE TABLE users.users (
	iduser serial NOT NULL,
	username varchar NOT NULL,
	password varchar NOT NULL,
	name varchar NULL,
	email varchar NOT NULL,
	idrole int4 NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT users_pk PRIMARY KEY (iduser),
	CONSTRAINT users_unique UNIQUE (username),
	CONSTRAINT users_unique_1 UNIQUE (email),
	CONSTRAINT users_roles_fk FOREIGN KEY (idrole) REFERENCES users.roles(idrole)
);


CREATE TABLE courses.categories (
	idcategory serial NOT NULL,
	name varchar NOT NULL,
	description varchar NOT NULL,
	CONSTRAINT categories_pk PRIMARY KEY (idcategory)
);

CREATE TABLE courses.platforms (
	idplatform serial NOT NULL,
	name varchar NOT NULL,
	description varchar NOT NULL,
	CONSTRAINT platforms_pk PRIMARY KEY (idplatform)
);

CREATE TABLE courses.learningpaths (
	idpath serial NOT NULL,
	name varchar NOT NULL,
	description varchar NOT NULL,
	CONSTRAINT learningpaths_pk PRIMARY KEY (idpath)
);

CREATE TABLE courses.levels (
	idlevel serial NOT NULL,
	description varchar NOT NULL,
	CONSTRAINT levels_pk PRIMARY KEY (idlevel)
);

CREATE TABLE courses.modalities (
	idmodality serial NOT NULL,
	description varchar NOT NULL,
	CONSTRAINT modalities_pk PRIMARY KEY (idmodality)
);

CREATE TABLE courses.courses (
	idcourse serial NOT NULL,
	idcategory int NULL,
	idplatform int NULL,
	code int NULL,
	name varchar NULL,
	description varchar NULL,
	duration int NULL,
	cost float8 NULL,
	idlevel int NULL,
	idmodality int NULL,
	idpath int NULL,
	url varchar NULL,
	CONSTRAINT courses_pk PRIMARY KEY (idcourse),
	CONSTRAINT courses_categories_fk FOREIGN KEY (idcategory) REFERENCES courses.categories(idcategory),
	CONSTRAINT courses_platforms_fk FOREIGN KEY (idplatform) REFERENCES courses.platforms(idplatform),
	CONSTRAINT courses_learningpaths_fk FOREIGN KEY (idpath) REFERENCES courses.learningpaths(idpath),
	CONSTRAINT courses_levels_fk FOREIGN KEY (idpath) REFERENCES courses.levels(idlevel),
	CONSTRAINT courses_modalities_fk FOREIGN KEY (idpath) REFERENCES courses.modalities(idmodality)
);

INSERT INTO users.roles 
(idrole, name)
VALUES(1, 'admin');

INSERT INTO users.roles
(idrole, name)
VALUES(2, 'user');

INSERT INTO courses.categories
(idcategory, name, description)
VALUES(1, 'computacion', 'Categoria de computacion');

INSERT INTO courses.platforms
(idplatform, name, description)
VALUES(1, 'udemy', 'Plataforma de aprendizaje en línea');

INSERT INTO courses.levels
(idlevel, description)
VALUES(1, 'principiante');
INSERT INTO courses.levels
(idlevel, description)
VALUES(2, 'intermedio');
INSERT INTO courses.levels
(idlevel, description)
VALUES(3, 'avanzado');

INSERT INTO courses.modalities
(idmodality, description)
VALUES(1, 'virtual');
INSERT INTO courses.modalities
(idmodality, description)
VALUES(2, 'presencial');
INSERT INTO courses.modalities
(idmodality, description)
VALUES(3, 'hibrido');

INSERT INTO courses.courses
(idcourse, idcategory, idplatform, code, name, description, duration, cost, idlevel, idmodality, idpath, url)
VALUES(1, 1, 1, 5, 'Programación full-stack', 'Curso de programación web full-stack', 18, 150000, 1, 1, NULL, 'https://platzi.com/');

