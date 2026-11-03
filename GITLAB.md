# Enviar o projeto para o GitLab

1. Crie um projeto vazio no GitLab com o nome `turbo-run-3d`.
2. Abra o terminal dentro da pasta `turbo-run-3d`.
3. Execute os comandos abaixo, substituindo `COLE_A_URL_DO_SEU_REPOSITORIO` pelo endereço HTTPS mostrado no seu GitLab.

```bash
git init
git add .
git commit -m "Primeira versão do Turbo Run 3D"
git branch -M main
git remote add origin COLE_A_URL_DO_SEU_REPOSITORIO
git push -u origin main
```

Se o Git pedir para entrar na conta, siga a autenticação apresentada pelo GitLab.

Depois, configure o GitLab Pages nas configurações/pipeline do projeto e teste o endereço público antes de entregar.
