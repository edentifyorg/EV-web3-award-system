## 📦 Tech Stack

- [NestJS](https://nestjs.com/) – Scalable Node.js framework
- [Prisma ORM](https://www.prisma.io/) – Next-gen TypeScript ORM
- [PostgreSQL 17](https://www.postgresql.org/)
- [Docker + Compose](https://docs.docker.com/)
- [ESLint + Prettier](https://eslint.org/) – Linting and formatting
- [Husky](https://typicode.github.io/husky/#/) – Git hooks
- [Jest](https://jestjs.io/) – Unit + E2E testing
- [GitHub Actions](https://github.com/features/actions) – CI ready

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-org/your-repo.git
cd nestjs-starter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` from the example

```bash
cp .env.example .env
```

### 4. Start development environment (Docker)

```bash
docker-compose up --build
```

---

## 🧪 Prisma & Database

### Run migrations (dev DB)

```bash
npx prisma migrate dev
```

### Generate Prisma client

```bash
npm run prisma:generate
```

### Seed data

```bash
npx ts-node prisma/seed/index.ts
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## 🧹 Code Quality

### Format code

```bash
npm run format
```

### Lint code

```bash
npm run lint
```

Pre-commit hooks (via Husky) will auto-check lint and formatting.

---

## 🐳 Docker Shortcuts

```bash
# Start app and db containers
docker-compose up --build

# Stop containers
docker-compose down

# Reset DB volumes
docker-compose down -v
```

---

## 🌱 Environment Variables

Environment variables are defined in:

- `.env.example` – use this as a base to create `.env`
- Loaded automatically by Docker + NestJS

```env
# Example
DATABASE_URL=postgres://postgres:123@localhost:5432/sub
PORT=3000
```

---

## 🔐 Git Hooks (Husky)

Pre-configured Husky hooks run:

- Lint + Prettier checks before commit

---

## 🧠 VS Code Setup

Workspace settings ensure:

- Prettier on save
- ESLint auto-fix

Make sure you have these extensions:

```json
.vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

---

## 🚦 CI/CD with GitHub Actions

CI runs on every push to main and pull request:

- Lint
- Test
- Build

Defined in `.github/workflows/development.yaml`.

---

## 📁 Project Structure

```bash
.
├── prisma/               # Prisma schema, migrations, seed
├── src/                  # NestJS app code
├── test/                 # E2E tests
├── .husky/               # Git hooks
├── .vscode/              # Editor settings
├── docker-compose.yaml   # Local dev env
├── Dockerfile.dev        # Dev Docker build
├── nest-cli.json         # Nest CLI config
├── tsconfig*.json        # TS configs
└── README.md
```

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/awesome`
3. Commit your changes: `git commit -m 'Add awesome feature'`
4. Push to the branch: `git push origin feature/awesome`
5. Open a pull request

---

## 📜 License

MIT © 2025 \[Your Name or Organization]
