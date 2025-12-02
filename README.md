# TCC DISPEXA - Jonas e Tiago

Instruções para rodar o projeto localmente (frontend + backend PHP).

**Pré-requisitos**
- PHP (7.4 ou superior) instalado.
- MySQL / MariaDB (ou outro servidor compatível) para importar o esquema do banco.
- Extensão PHP `pdo_mysql` habilitada (usada pela conexão com MySQL).

**Configuração do banco de dados**
1. Edite o arquivo `backend/config/conexao.php` e ajuste as credenciais de conexão se necessário. As variáveis padrão localizadas no projeto são exemplos:

```
$host = 'localhost';
$dbname = 'dispexa';
$username = 'root';
$password = 'root';
```

2. Importe o esquema inicial do banco [arquivo SQL](backend/sql/create_schema.sql):

 - Pelo terminal (exemplo):

```
mysql -u root -p dispexa < backend/sql/create_schema.sql
```

ou use o MySQL Workbench para importar `backend/sql/create_schema.sql`.

**Executando o site (modo rápido, sem Apache/Nginx)**
1. Abra um terminal na raiz do projeto (`c:\Users\...\TCC-`).
2. Inicie o servidor PHP embutido:

```
php -S localhost:3000.
```

3. Abra o navegador em `http://localhost:3000/



**Usando o VS Code**
Existe uma task pronta para iniciar o servidor PHP via terminal integrado do VS Code:

1. Abra o painel de tarefas (`Terminal` → `Run Task...`).
2. Selecione `Start PHP Server`.

**Solução de problemas**
- Se `php` não for reconhecido, instale o PHP e adicione ao `PATH` do Windows.
- Se houver erros de conexão com o banco, verifique o usuário/senha e se o banco `dispexa` existe.
- Verifique se a extensão `pdo_mysql` está habilitada no `php.ini`.


**Usuário com permissao de admin**
- email: *$admin@dispexa.local$*
- senha: *$40028922$*