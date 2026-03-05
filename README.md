<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/081b1422-198d-4835-bc5f-ecafce7c0326

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy automático via GitHub Actions

O deploy é disparado automaticamente a cada push na branch `main`, ou manualmente pelo GitHub Actions.

### Secrets necessários

Configure os seguintes secrets em **Settings → Secrets and variables → Actions** do repositório:

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | IP da VPS (ex: `72.61.59.3`) |
| `VPS_USER` | Usuário SSH (ex: `root`) |
| `VPS_SSH_PORT` | Porta SSH (ex: `22`) |
| `VPS_SSH_KEY` | Chave privada SSH (conteúdo completo do arquivo `id_rsa` ou `id_ed25519`) |
| `REPO_SSH_URL` | URL SSH do repositório (ex: `git@github.com:thiagogiordano-code/radarcognitivo.git`) |
| `DB_PASSWORD` | Senha do banco PostgreSQL |
| `GEMINI_API_KEY` | Chave da API Gemini |

### Configurar autenticação SSH na VPS

Na sua máquina local, gere um par de chaves dedicado para o deploy:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/radarcognitivo_deploy
```

Adicione a chave pública na VPS:

```bash
ssh-copy-id -i ~/.ssh/radarcognitivo_deploy.pub root@72.61.59.3
# ou manualmente:
cat ~/.ssh/radarcognitivo_deploy.pub | ssh root@72.61.59.3 "cat >> ~/.ssh/authorized_keys"
```

Adicione a chave privada como secret `VPS_SSH_KEY` no GitHub (conteúdo de `~/.ssh/radarcognitivo_deploy`).

### Clonar o repositório na VPS (primeiro deploy)

Na VPS, adicione a deploy key do repositório e clone manualmente:

```bash
# Configure a deploy key no GitHub (Settings → Deploy keys) com a chave pública
# Depois clone na VPS:
git clone git@github.com:thiagogiordano-code/radarcognitivo.git /opt/radarcognitivo
```

A partir do segundo deploy, o workflow faz `git fetch` + `git reset --hard` automaticamente.

### Disparar manualmente

Na aba **Actions** do GitHub, selecione o workflow **Deploy to VPS** e clique em **Run workflow**.

### Testar SSH localmente

```bash
ssh -i ~/.ssh/radarcognitivo_deploy -p 22 root@72.61.59.3 "docker ps"
```

### Resultado esperado no log do Actions

```
== .env: COMPOSE_PROJECT_NAME=radarcognitivo ==
>>> [4] FRONTEND_HOST_PORT=3000
== Deploy concluded. FRONTEND_HOST_PORT=3000 ==
```

E no `docker ps`:

```
0.0.0.0:3000->80/tcp
```
