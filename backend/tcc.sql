CREATE TABLE `tcc`.`usuarios` (
  `idusuario` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(45) NOT NULL,
  `data_nascimento` DATE NULL,
  `email` VARCHAR(45) NOT NULL,
  `senha` VARCHAR(57) NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idusuario`));
